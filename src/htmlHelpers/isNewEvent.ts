import { InviteEvent } from "../models/InviteEvent";

export function isNewEvent(event: InviteEvent):boolean {
    return event.Id != null;
}