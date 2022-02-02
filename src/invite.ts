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
import { RequestHelper } from "./infrastructure/RequestHelper"

async function eventsList(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var helper = new RequestHelper(request,h);
    var ravenSession = helper.ravenSession;

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
          event.DeletedAndNotFoundCount = stats.DeletedCount + stats.NotFoundCount;
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

    return helper.view("eventsList", {
        events: events,
    });
}

async function eventsEdit(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var helper = new RequestHelper(request,h);

    var event = new InviteEvent();
    if (helper.id) {
      event = await helper.ravenSession.load<InviteEvent>(helper.id);
    }

    return helper.view("eventsEdit", {
      event: event
    });
}

async function eventsStore(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var helper = new RequestHelper(request, h);
    var ravenSession = helper.ravenSession;
    var viewModel = <InviteEvent>request.payload;

    if (!viewModel.Name) {
      return helper.view("eventsEdit", {
        event: viewModel,
        error: "Event name should not be empty."
      });
    }

    var model:InviteEvent = null;
    if (!viewModel.Id) {
      model = new InviteEvent(viewModel);
      model.AccountId = helper.auth.SeedsAccount;
    } else {
      model = await ravenSession.load<InviteEvent>(viewModel.Id)
    }
    model.Name = viewModel.Name;
    model.Application = viewModel.Application;
    model.Status = InviteEventStatus.Active;
    if(model.Slug!=viewModel.Slug && viewModel.Slug != null){
      var countSlugExisting = await ravenSession.query<InviteEvent>({ collection:"InviteEvents" })
                                                .whereEquals("Slug",viewModel.Slug)
                                                .whereNotEquals("Id",viewModel.Id)
                                                .waitForNonStaleResults()
                                                .count();
      if ( countSlugExisting > 0 ) {
        return helper.view("eventsEdit", {
          event: viewModel,
          error: `An event with Permalink Slug '${viewModel.Slug}'  already exists.`
        });
      }
      model.Slug = viewModel.Slug;
    }
    if (!model.Slug) {
      model.Slug = uuidv4().slice(28);
    }
    
    await ravenSession.store(model);

    if (!viewModel.Id) {
      return h.redirect("/events/aftercreate/"+model.Id);
    }

    return h.redirect("/events/view/"+model.Id);
}

async function afterCreate(request:Request, h:ResponseToolkit):Promise<ResponseObject> {
  var helper = new RequestHelper(request, h);
  var id = helper.id;
  
  return helper.view("afterCreate", { id: id });
}

async function importView(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var helper = new RequestHelper(request, h);
  var event = await helper.ravenSession.load<InviteEvent>(helper.id);

  return helper.view("import", {
    event:event
  });
}

async function importSave(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var helper = new RequestHelper(request, h);
  var ravenSession = helper.ravenSession;
  
  var event = await ravenSession.load<InviteEvent>(helper.id);
  var viewModel = new InviteImport(<InviteImport>request.payload);
  viewModel.EventId = event.Id;
  viewModel.AccountId = event.AccountId;
  viewModel.SecretIdsImported = new Array<string>();

  var list = new Array<SeedsInvite>();
  try {
    var rows = viewModel.ImportText.split('\r\n');
    for(var i=0;i< rows.length;i++){
      var secret = rows[i].split('=')[1].trim();
      var invite = new SeedsInvite();
      invite.EventId = event.Id;
      invite.AccountId = event.AccountId;
      invite.Secret = secret;
      invite.Hash = GetHashFromSecret(secret);
      
      list.push(invite);
    }
  } catch {
    return h.view("import", {
      event: event,
      error: "We encountered an error in parsing the invites string. Please check if the format is correct and try again."
    });
  }
  var secrets = list.map(x=>x.Secret);
  var existingInvites = await ravenSession.query<SeedsInvite>({index:SeedsInvites_All})
                                          .whereIn("Secret",secrets)
                                          .all();
  var skippedInvites = 0;
  for (var i=0; i<list.length; i++) {
    var invite = list[i];
    var existing = existingInvites.find(x=>x.Secret == invite.Secret);
    if(!existing){
      await ravenSession.store(invite);
        
      viewModel.SecretIdsImported.push(invite.Id??"");
    } else {
      skippedInvites++;
    }
  }

  console.log(`Skipped invites: ${skippedInvites}`)

  await ravenSession.store(viewModel);

  return h.redirect("/events/view/"+event.Id);
}

async function toggleStatus(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var helper = new RequestHelper(request, h);
  var ravenSession = helper.ravenSession;
  
  var event = await ravenSession.load<InviteEvent>(helper.id);

  if(event.Status == InviteEventStatus.Active){
    event.Status = InviteEventStatus.Inactive;
  } else {
    event.Status = InviteEventStatus.Active;
  }

  return h.redirect("/events/view/"+event.Id);
}

async function toggleInviteStatus(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  var helper = new RequestHelper(request, h);
  var ravenSession = helper.ravenSession;

  var invite = await ravenSession.load<SeedsInvite>(helper.id);

  if ( invite.Status == InviteStatus.Sent ) {
    invite.Status = InviteStatus.Available;
    invite.SentOn = null;
  }

  return h.redirect("/events/view/"+invite.EventId);
}

async function view(request:Request, h:ResponseToolkit):Promise<ResponseObject> {
  var helper = new RequestHelper(request, h);
  var ravenSession = helper.ravenSession;
  var event = await ravenSession.load<InviteEvent>(helper.id);

  var eventUrl = `${helper.baseUrl}/i/${event.Slug}`;
  var qrCode = await QRCode.toDataURL(eventUrl);

  event.Permalink = eventUrl;
  event.QRCode = qrCode;

  var invites = await ravenSession.query<SeedsInvite>({index: SeedsInvites_All})
                                  .whereEquals("EventId", event.Id)
                                  .orderBy("StatusForSort")
                                  .orderByDescending("SentOn")
                                  .all();
  
  var seedsInvitesInfo = await GetInvitesForAccount(helper.auth.SeedsAccount);

  for ( var i=0; i< invites.length; i++ ) {
    var localInvite = invites[i];
    var blochainInvite = seedsInvitesInfo.find(invite=>invite.invite_hash == localInvite.Hash);
    if(blochainInvite){
      localInvite.SowQuantityString = blochainInvite.sow_quantity;
      localInvite.TransferQuantityString = blochainInvite.transfer_quantity;
      localInvite.BlockchainInviteId = blochainInvite.invite_id;
      localInvite.ParseQuantities();
      if(blochainInvite.account && blochainInvite.account != ''){
        localInvite.Status = InviteStatus.Redeemed;
        localInvite.RedeemedAccount = blochainInvite.account;
      }
    } else {
      if(localInvite.BlockchainInviteId){
        localInvite.Status = InviteStatus.Deleted;
      } else {
        localInvite.Status = InviteStatus.NotFound;
      }
    }
  }

  return helper.view("view", {
    event:event,
    baseUrl: helper.baseUrl,
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
    path: "/events/aftercreate/{id}",
    handler: afterCreate
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
