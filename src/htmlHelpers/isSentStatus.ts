import { InviteStatus } from "../models/SeedsInvite";

export function isSentStatus(obj: InviteStatus) {
    return obj == InviteStatus.Sent;
};