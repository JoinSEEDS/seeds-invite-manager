import { number } from "joi";
import { AbstractJavaScriptIndexCreationTask } from "ravendb";
import { InviteStatus, SeedsInvite } from "../SeedsInvite";

export class SeedsInvites_All extends AbstractJavaScriptIndexCreationTask<SeedsInvite, { EventId: string, SentOn: Date, Status: InviteStatus, StatusForSort: number }> {
    public constructor() {
        super();

        const { load } = this.mapUtils();

        this.map(SeedsInvite, se => {
            var sortStatus = 0;
            switch(se.Status)   {
                case InviteStatus.Available:
                    sortStatus = 0;
                    break;
                case InviteStatus.Sent:
                    sortStatus = 1;
                    break;
                case InviteStatus.Redeemed:
                    sortStatus = 2;
                    break;
                default:
                    break;
            }
            return {
                EventId: se.EventId,
                SentOn: se.SentOn,
                Status: se.Status,
                StatusForSort: sortStatus
            }
        });
    }
}
