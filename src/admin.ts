import Boom from "@hapi/boom";
import { Request, ResponseObject, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { IDocumentSession } from "ravendb";
import { RequestHelper } from "./infrastructure/RequestHelper";
import { SeedsInvites_All } from "./models/indexes/SeedsInvites_All";
import { getResetMinutes, updateInvitesFromBlockchain } from "./infrastructure/extensions"
import { InviteStatus, SeedsInvite } from "./models/SeedsInvite";
import { InviteEvent, InviteEventStatus, ResetUnclaimedInvites } from "./models/InviteEvent";
import moment from 'moment-timezone'

export class AccountInfo{
    AccountId: string
    Count: number
  }
  
  async function refreshInviteData(request:Request, h:ResponseToolkit):Promise<ResponseObject> {
    if (request.params.key!=process.env.ADMIN_API_KEY) {
        throw Boom.unauthorized("You are not allowed to view this page. Key Invalid.");
    }

    var helper = new RequestHelper(request, h);
    var ravenSession = helper.ravenSession;
  
    var accountNames = await ravenSession.query<SeedsInvite>( { collection: "SeedsInvites" } )
                                        .groupBy("AccountId")
                                        .selectKey("AccountId")
                                        .selectCount()
                                        .ofType(AccountInfo)
                                        .all();
    var invitesCount = 0;
    var exceptionsCount = 0;
    for ( var i = 0; i < accountNames.length; i++ ) {
      var item = accountNames[i];
      var localSession:IDocumentSession = null;
      try {
        localSession = await ravenSession.advanced.documentStore.openSession();
        
        var seedsInvites = await localSession.query<SeedsInvite>( { index:SeedsInvites_All } )
                                       .whereEquals("AccountId", item.AccountId)
                                       .all();
        
        await updateInvitesFromBlockchain(seedsInvites, item.AccountId);
        
        var eventIds = [...new Set(seedsInvites.map(x=>x.EventId))];
        var events = await localSession.query<InviteEvent>({collection:"InviteEvents"})
                                      .whereIn("Id", eventIds)
                                      .whereEquals("Status", InviteEventStatus.Active)
                                      .whereNotEquals("ResetUnclaimedInvites", ResetUnclaimedInvites.Never)
                                      .all();

        for (var j = 0; j < events.length; j++) {
          var event = events[j];
          var invites = seedsInvites.filter(x=>x.EventId == event.Id && x.Status == InviteStatus.Sent);
          for(var k=0; k < invites.length; k++){
              var invite = invites[k];
              
              var resetMinutes = getResetMinutes(event.ResetUnclaimedInvites);
              
              if(resetMinutes){
                  var sentBefore = moment().tz("UTC").diff(invite.SentOn,"minutes");
                  if(sentBefore>=resetMinutes){
                    invite.Status = InviteStatus.Available;
                  }
              }
          }
        }
        
        invitesCount += seedsInvites.length;
      } catch {
        exceptionsCount++;
        localSession.advanced.clear();
      } finally {
        if(localSession?.advanced.hasChanges()){
          localSession.saveChanges();
        }
        localSession.dispose();
      }
    }
    
    return h.response( `ok. accounts:${accountNames.length}, invites: ${invitesCount}, exceptions: ${exceptionsCount}`  );
  }

  
export const adminRoutes: ServerRoute[] = [
    {
      method: "GET",
      path: "/admin/refresh/{key}",
      handler: refreshInviteData
    },
  ];
  