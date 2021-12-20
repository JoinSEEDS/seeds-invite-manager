import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import { InviteApp, InviteEvent, InviteEventStatus } from "./models/InviteEvent";
import {v4 as uuidv4} from 'uuid';
import { response } from "express";
import { InviteStatus, SeedsInvite } from "./models/SeedsInvite";
import { RavenDbProcessMonitor } from "./infrastructure/ravenDBProcessMonitor";
import { getFirebaseDynamicLink } from "./infrastructure/firebaseDynamicLink";
import { Exception } from "handlebars";

const PassportUrl = "https://joinseeds.app.link/accept-invite?invite-secret=";

async function inviteItem(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var ravenSession = request.server.plugins.ravendb.session;
    
    var event = await ravenSession.query<InviteEvent>({collection:"InviteEvents"})
                                    .whereEquals("Slug", request.params.id)
                                    .firstOrNull();

    if(event?.Status == InviteEventStatus.Active){
      var monitor = new RavenDbProcessMonitor();

      var lockIndex = await monitor.lockResource(event.Id);
      try {
        var invite  = await ravenSession.query<SeedsInvite>({collection:"SeedsInvites"})
                                        .waitForNonStaleResults()
                                        .whereEquals("EventId", event.Id)
                                        .whereEquals("Status", InviteStatus.Available)
                                        .firstOrNull();
        if (invite != null) {
          invite.Status = InviteStatus.Sent;
          invite.SentOn = new Date();
          
          ravenSession.saveChanges();

          switch (event.Application) {
            case InviteApp.Wallet:
              if (!invite.WalletDynamicLink) {
                var response = await getFirebaseDynamicLink(invite.Secret);
  
                invite.WalletDynamicLinkInfo = response;
                invite.WalletDynamicLink = <string>response.shortLink;
                ravenSession.saveChanges();
              }
              return h.redirect( invite.WalletDynamicLink );
            case InviteApp.Passport:
              return h.redirect( PassportUrl + invite.Secret );
            default:
              throw new Exception("Not Implemented: " + event.Application);
          }
        }

        // Handle if no invites are available

      } finally {
        await monitor.releaseResource(event.Id, lockIndex);
      }
    }
    
    return h.response("redirect to invite");
}

export const inviteLinkRoutes: ServerRoute[] = [
    {
      method: "GET",
      path: "/i/{id}",
      handler: inviteItem
    }
  ];
  