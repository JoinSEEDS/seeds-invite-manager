import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi"
import { InviteEvent, InviteEventStatus } from "./models/InviteEvent"
import {v4 as uuidv4} from 'uuid'
import QRCode from 'qrcode'
import { InviteImport } from "./models/InviteImport"
import { InviteStatus, SeedsInvite } from "./models/SeedsInvite"
import { OrderingType } from 'ravendb'
import { SeedsInvites_All } from "./models/indexes/SeedsInvites_All"
import { GetHashFromSecret, GetInvitesForAccount } from "./infrastructure/telosClient"
import e from "express"
import { SeedsInvites_Stats, SeedsInvites_Stats_ReduceResult } from "./models/indexes/SeedsInvites_Stats"

async function eventsList(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var ravenSession = request.server.plugins.ravendb.session;

    var events = await ravenSession.query<InviteEvent>({collection:"InviteEvents"})
                                    .whereEquals("AccountId", request.auth.credentials.SeedsAccount)
                                    .all();

    var inviteStats = await ravenSession.query<SeedsInvites_Stats_ReduceResult>({ index: SeedsInvites_Stats })
                              .whereEquals("AccountId", request.auth.credentials.SeedsAccount)
                              //.projectInto<SeedsInvites_Stats_ReduceResult>()
                              .all();

    for ( var i=0; i < events.length; i++ ) {
        var event = events[i];
        var stats = inviteStats.find(x=>x.EventId == event.Id);
        if(stats){
          event.AvailableCount = stats.AvailableCount;
          event.SentCount = stats.SentCount;
          event.RedeemedCount = stats.RedeemedCount;
        }
      }
    events = events.sort((x,y)=> {
      if(x.Status == y.Status){
        return 0;
      }
      if(x.Status == InviteEventStatus.Active){
          return -1;
      }
    
      return 1; 
  });

    return h.view("eventsList", {
        events: events
    });
}

async function eventsEdit(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var ravenSession = request.server.plugins.ravendb.session;  
    var id = request.params.id;
    var event = new InviteEvent();
    if (id) {
      event = await ravenSession.load<InviteEvent>(id);
    }

    return h.view("eventsEdit", {
      event: event
    });
}

async function eventsStore(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var ravenSession = request.server.plugins.ravendb.session;
    var viewModel = <InviteEvent>request.payload;

    

    var model:InviteEvent = null;
    if (!viewModel.Id) {
      model = new InviteEvent(viewModel);
      model.AccountId = <string>request.auth.credentials.SeedsAccount;
    } else {
      model = await ravenSession.load<InviteEvent>(viewModel.Id)
    }
    model.Name = viewModel.Name;
    model.Application = viewModel.Application;
    //TODO: validate if Slug is unique
    model.Slug = viewModel.Slug;
    if (!model.Slug) {
      model.Slug = uuidv4().slice(28);
    }
    

    await ravenSession.store(model);

    return h.redirect("/events/view/"+model.Id);
}

async function importView(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var ravenSession = request.server.plugins.ravendb.session;
  var id = request.params.id;
  var event = await ravenSession.load<InviteEvent>(id);

  return h.view("import", {
    event:event
  });
}

async function importSave(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var ravenSession = request.server.plugins.ravendb.session;
  var id = request.params.id;
  var event = await ravenSession.load<InviteEvent>(id);
  var viewModel = new InviteImport(<InviteImport>request.payload);
  viewModel.EventId = event.Id;
  viewModel.AccountId = event.AccountId;
  viewModel.SecretIdsImported = new Array<string>();

  var rows = viewModel.ImportText.split('\r\n');
  for(var i=0;i< rows.length;i++){
    var secret = rows[i].split('=')[1].trim();
    var invite = new SeedsInvite();
    invite.EventId = event.Id;
    invite.AccountId = event.AccountId;
    invite.Secret = secret;
    invite.Hash = GetHashFromSecret(secret);

    await ravenSession.store(invite);

    viewModel.SecretIdsImported.push(invite.Id??"");
  }

  await ravenSession.store(viewModel);

  return h.redirect("/events/view/"+event.Id);
}

async function toggleStatus(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var ravenSession = request.server.plugins.ravendb.session;
  var id = request.params.id;
  var event = await ravenSession.load<InviteEvent>(id);

  if(event.Status == InviteEventStatus.Active){
    event.Status = InviteEventStatus.Inactive;
  } else {
    event.Status = InviteEventStatus.Active;
  }

  return h.redirect("/events/view/"+event.Id);
}

async function toggleInviteStatus(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var ravenSession = request.server.plugins.ravendb.session;
  var id = request.params.id;
  var invite = await ravenSession.load<SeedsInvite>(id);

  if ( invite.Status == InviteStatus.Sent ) {
    invite.Status = InviteStatus.Available;
    invite.SentOn = null;
  }

  return h.redirect("/events/view/"+invite.EventId);
}

async function view(request:Request, h:ResponseToolkit):Promise<ResponseObject> {
  var id = request.params.id;
  var ravenSession = request.server.plugins.ravendb.session;
  var event = await ravenSession.load<InviteEvent>(id);

  var baseUrl = `${request.headers['x-forwarded-proto'] || request.server.info.protocol}://${request.headers['x-forwarded-host'] || request.info.host}`;
  var eventUrl = `${baseUrl}/i/${event.Slug}`;
  var qrCode = await QRCode.toDataURL(eventUrl);

  event.Permalink = eventUrl;
  event.QRCode = qrCode;

  var invites = await ravenSession.query<SeedsInvite>({index: SeedsInvites_All})
                                  .whereEquals("EventId", event.Id)
                                  .orderBy("StatusForSort")
                                  .orderByDescending("SentOn")
                                  .all();
  
  var seedsInvitesInfo = await GetInvitesForAccount(<string>request.auth.credentials.SeedsAccount);

  for ( var i=0; i< invites.length; i++ ) {
    var localInvite = invites[i];
    var blochainInvite = seedsInvitesInfo.find(invite=>invite.invite_hash == localInvite.Hash);
    if(blochainInvite){
      localInvite.SowQuantityString = blochainInvite.sow_quantity;
      localInvite.TransferQuantityString = blochainInvite.transfer_quantity;
      localInvite.ParseQuantities();
      if(blochainInvite.account && blochainInvite.account != ''){
        localInvite.Status = InviteStatus.Redeemed;
        localInvite.RedeemedAccount = blochainInvite.account;
      }
    }
  }

  return h.view("view", {
    event:event,
    baseUrl: baseUrl,
    qrCode: qrCode, 
    invites: invites,
    eventUrl: eventUrl
  });
}

export const inviteRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/events",
    handler: eventsList
  },
  {
    method: "GET",
    path: "/events/edit/{id?}",
    handler: eventsEdit
  },
  {
    method: "POST",
    path: "/events/edit",
    handler: eventsStore
  },
  {
    method: "GET",
    path: "/events/view/{id}",
    handler: view
  },
  {
    method: "GET",
    path: "/events/import/{id}",
    handler: importView
  },
  {
    method: "POST",
    path: "/events/import/{id}",
    handler: importSave
  },
  {
    method: "GET",
    path: "/events/toggleStatus/{id}",
    handler: toggleStatus
  },
  {
    method: "GET",
    path: "/events/toggleInviteStatus/{id}",
    handler: toggleInviteStatus
  }
];
