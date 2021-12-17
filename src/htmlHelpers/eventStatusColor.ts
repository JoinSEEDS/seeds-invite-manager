import { notImplemented } from '@hapi/boom';
import Handlebars, { Exception } from 'handlebars';
import { InviteEventStatus } from '../models/InviteEvent';

export function eventStatusColor(obj: InviteEventStatus) {
    switch(obj){
        case InviteEventStatus.Active:
            return "outline-success";
        case InviteEventStatus.Inactive:
            return "danger";
        default:
            throw new Exception("not implementd: " + obj);
    }
};