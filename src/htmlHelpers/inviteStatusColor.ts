import Handlebars from 'handlebars';
import { InviteStatus } from '../models/SeedsInvite';

export function inviteStatusColor(obj: InviteStatus) {
    switch(obj){
        case InviteStatus.Available:
            return "success";
        case InviteStatus.Sent:
            return "info";
        default:
            return "secondary";
    }
};