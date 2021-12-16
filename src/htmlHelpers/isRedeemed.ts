import { InviteStatus } from "../models/SeedsInvite";

export function isRedeemed(obj: InviteStatus) {
    return obj == InviteStatus.Redeemed;
};