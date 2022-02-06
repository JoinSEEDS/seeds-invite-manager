import { DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery } from 'ravendb';
import { ResetUnclaimedInvites } from '../models/InviteEvent';

import { InviteStatus, SeedsInvite } from "../models/SeedsInvite";
import { RequestHelper } from './RequestHelper';
import { GetInvitesForAccount } from "./telosClient";


declare module '@hapi/hapi' {
    export interface PluginProperties {
        ravendb:{
            session: IDocumentSession; // TODO define
        }
    }
  }

  
export async function updateInvitesFromBlockchain(invites: SeedsInvite[], helper: RequestHelper){
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
  }

export function getResetMinutes(params:ResetUnclaimedInvites):number {
    switch(params){
        case ResetUnclaimedInvites.After10Mins:
            return 10;
        case ResetUnclaimedInvites.After15Mins:
            return 15;
        case ResetUnclaimedInvites.After30Mins:
            return 30;
        case ResetUnclaimedInvites.After60Mins:
            return 60;
        case ResetUnclaimedInvites.Never:
        default:
            return null;
    }
}