import { number } from "joi";
import { AbstractJavaScriptIndexCreationTask } from "ravendb";
import { InviteStatus, SeedsInvite } from "../SeedsInvite";

export class SeedsInvites_All extends AbstractJavaScriptIndexCreationTask<SeedsInvite, { EventId: string, SentOn: Date, Status: string, StatusForSort: number }> {
    public constructor() {
        super();

        const { load } = this.mapUtils();

        this.map(SeedsInvite, se => {
            var sortStatus = 0;
            switch(se.Status)   {
                case "Available":
                    sortStatus = 0;
                    break;
                case "Sent":
                    sortStatus = 1;
                    break;
                case "Redeemed":
                    sortStatus = 2;
                    break;
                case "NotFound":
                    sortStatus = 3;
                    break;
                case "Deleted":
                    sortStatus = 4;
                    break;
                default:
                    break;
            }
            return {
                EventId: se.EventId,
                SentOn: se.SentOn,
                Status: se.Status,
                StatusForSort: sortStatus,
                Secret: se.Secret,
                AccountId: se.AccountId
            }
        });
    }
}
