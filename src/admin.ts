import Boom from "@hapi/boom";
import { Request, ResponseObject, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { IDocumentSession } from "ravendb";
import { RequestHelper, updateInvitesFromBlockchain } from "./infrastructure/RequestHelper";
import { SeedsInvites_All } from "./models/indexes/SeedsInvites_All";
import { InviteEvent } from "./models/InviteEvent";
import { SeedsInvite } from "./models/SeedsInvite";

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
  
        updateInvitesFromBlockchain(seedsInvites,helper);
        
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
  