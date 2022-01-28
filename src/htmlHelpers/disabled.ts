import { InviteEvent } from "../models/InviteEvent";

export function disabled(shouldDisable: boolean):string {
    return shouldDisable == true ? "disabled":"";
}