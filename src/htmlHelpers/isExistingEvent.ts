import { InviteEvent } from "../models/InviteEvent";

export function isExistingEvent(event: InviteEvent):boolean {
    return !!event.Id;
}