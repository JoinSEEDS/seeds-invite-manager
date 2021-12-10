import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import { InviteEvent, InviteEventStatus } from "./models/InviteEvent";
import {v4 as uuidv4} from 'uuid';
import { response } from "express";
import { InviteStatus, SeedsInvite } from "./models/SeedsInvite";

const PassportUrl = "https://joinseeds.app.link/accept-invite?invite-secret=";

async function inviteItem(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var ravenSession = request.server.plugins.ravendb.session;
    
    var event = await ravenSession.query<InviteEvent>({collection:"InviteEvents"})
                                    .whereEquals("Slug", request.params.id)
                                    .firstOrNull();

    if(event?.Status == InviteEventStatus.Active){
      var invite  = await ravenSession.query<SeedsInvite>({collection:"SeedsInvites"})
                                      .whereEquals("EventId", event.Id)
                                      .whereEquals("Status", InviteStatus.Available)
                                      .firstOrNull();
      if (invite != null) {
        invite.Status = InviteStatus.Sent;
        invite.SentOn = new Date();
        
        return h.redirect( PassportUrl + invite.Secret );
      }
    }
    //TODO: Redirect to invite from the event pool
    //1. Create a lock
    //2. Pull a invite from the pool
    //3. Mark it as 'sent' with current datetime
    //4. Release the lock
    //5. Redirect the person to the invite

    return h.response("redirect to invite");
}

export const inviteLinkRoutes: ServerRoute[] = [
    {
      method: "GET",
      path: "/i/{id}",
      handler: inviteItem
    }
  ];
  