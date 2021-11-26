import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import { InviteEvent } from "./models/InviteEvent";

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
  
    return h.view("eventsEdit");
}

async function eventsStore(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var ravenSession = request.server.plugins.ravendb.session;
    var viewModel = <InviteEvent>request.payload;

    var model = new InviteEvent(viewModel);
    
    model.AccountId = <string>request.auth.credentials.SeedsAccount;

    await ravenSession.store(model);

    return h.redirect("/events");
}

export const inviteRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/events",
    handler: eventsList
  },
  {
    method: "GET",
    path: "/events/edit",
    handler: eventsEdit
  },
  {
    method: "POST",
    path: "/events/edit",
    handler: eventsStore
  }
];
