import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import { InviteEvent } from "./models/InviteEvent";
import {v4 as uuidv4} from 'uuid';

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
    model.Slug = uuidv4().slice(30);

    await ravenSession.store(model);

    return h.redirect("/events");
}

async function view(request:Request, h:ResponseToolkit):Promise<ResponseObject> {
  var id = request.params.id;
  var ravenSession = request.server.plugins.ravendb.session;
  var event = await ravenSession.load<InviteEvent>(id);


  return h.view("view", {
    event:event,
    baseUrl: `${request.headers['x-forwarded-proto'] || request.server.info.protocol}://${request.headers['x-forwarded-host'] || request.info.host}`
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
  }
];
