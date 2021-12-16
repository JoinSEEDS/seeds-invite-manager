import Handlebars from 'handlebars';
import { InviteStatus } from '../models/SeedsInvite';

export function inviteStatusColor(obj: InviteStatus) {
    switch(obj){
        case InviteStatus.Redeemed:
            return "success";
        case InviteStatus.Sent:
            return "info";
        default:
            return "light text-dark";
    }
};