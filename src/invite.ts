import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import { InviteEvent } from "./models/InviteEvent";
import {v4 as uuidv4} from 'uuid';
import QRCode from 'qrcode'
import { InviteImport } from "./models/InviteImport";
import { InviteStatus, SeedsInvite } from "./models/SeedsInvite";
import { OrderingType } from 'ravendb';
import { SeedsInvites_All } from "./models/indexes/SeedsInvites_All";

async function eventsList(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var ravenSession = request.server.plugins.ravendb.session;

    var events = await ravenSession.query<InviteEvent>({collection:"InviteEvents"})
                                    .whereEquals("AccountId", request.auth.credentials.SeedsAccount)
                                    .all();

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

    var model = new InviteEvent(viewModel);
    
    model.AccountId = <string>request.auth.credentials.SeedsAccount;
    model.Slug = uuidv4().slice(28);

    await ravenSession.store(model);

    return h.redirect("/events");
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

    await ravenSession.store(invite);

    viewModel.SecretIdsImported.push(invite.Id??"");
  }

  await ravenSession.store(viewModel);

  return h.redirect("/events/view/"+event.Id);
}

async function view(request:Request, h:ResponseToolkit):Promise<ResponseObject> {
  var id = request.params.id;
  var ravenSession = request.server.plugins.ravendb.session;
  var event = await ravenSession.load<InviteEvent>(id);

  var baseUrl = `${request.headers['x-forwarded-proto'] || request.server.info.protocol}://${request.headers['x-forwarded-host'] || request.info.host}`;
  var eventUrl = `${baseUrl}/i/${event.Slug}`;
  var qrCode = await QRCode.toDataURL(eventUrl);

  var invites = await ravenSession.query<SeedsInvite>({index: SeedsInvites_All})
                                  .whereEquals("EventId", event.Id)
                                  .orderBy("StatusForSort")
                                  .orderByDescending("SentOn")
                                  .all();

  return h.view("view", {
    event:event,
    baseUrl: baseUrl,
    qrCode: qrCode, 
    invites: invites
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
  }
];
