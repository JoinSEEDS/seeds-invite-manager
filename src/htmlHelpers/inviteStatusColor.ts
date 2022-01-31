import { InviteStatus } from '../models/SeedsInvite';

export function inviteStatusColor(obj: InviteStatus) {
    switch(obj){
        case InviteStatus.Redeemed:
            return "success";
        case InviteStatus.Sent:
            return "info";
        case InviteStatus.Deleted:
            return "warning";
        case InviteStatus.NotFound:
            return "warning";
        default:
            return "light text-dark";
    }
};