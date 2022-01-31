import { InviteStatus } from "../models/SeedsInvite";

export function showPartly(obj: string) {
    return obj.slice(0,10)+"..." + obj.slice(30,44);
};