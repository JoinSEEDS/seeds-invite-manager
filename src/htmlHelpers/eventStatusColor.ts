import { Exception } from 'handlebars';
import { InviteEventStatus } from '../models/InviteEvent';

export function eventStatusColor(obj: InviteEventStatus, forControl?:string) {
    switch(obj){
        case InviteEventStatus.Active:
            if( forControl == "badge" ){
                return "success";
            }
            return "outline-success";
        case InviteEventStatus.Inactive:
            return "danger";
        default:
            throw new Exception("not implementd: " + obj);
    }
};