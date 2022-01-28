import { InviteStatus } from "../models/SeedsInvite";

export function showPartly(obj: string) {
    return "..." + obj.slice(20,44);
};