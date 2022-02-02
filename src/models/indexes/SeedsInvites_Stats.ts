import { AbstractJavaScriptIndexCreationTask } from "ravendb";
import { SeedsInvite } from "../SeedsInvite";


export class SeedsInvites_Stats_ReduceResult {
    AccountId: string
    EventId: string
    AvailableCount: number
    SentCount: number
    RedeemedCount: number
    DeletedCount: number
    NotFoundCount: number
}

export class SeedsInvites_Stats extends AbstractJavaScriptIndexCreationTask<SeedsInvite, SeedsInvites_Stats_ReduceResult> {
    public constructor() {
        super();

        const { load } = this.mapUtils();

        this.map(SeedsInvite, se => {
            return {
                AccountId: se.AccountId,
                EventId: se.EventId,
                AvailableCount: se.Status == "Available" ? 1 : 0,
                SentCount: se.Status == "Sent" ? 1 : 0,
                RedeemedCount: se.Status == "Redeemed" ? 1 : 0,
                DeletedCount: se.Status == "Deleted" ? 1 : 0,
                NotFoundCount: se.Status == "NotFound" ? 1 : 0
            }
        });

        this.reduce(results => results
            .groupBy(x => x.EventId)
            .aggregate(g => {
                return {
                    AccountId: g.values[0].AccountId,
                    EventId: <string>g.key,
                    AvailableCount: g.values.reduce((total, val) => val.AvailableCount + total, 0),
                    SentCount: g.values.reduce((total, val) => val.SentCount + total, 0),
                    RedeemedCount: g.values.reduce((total, val) => val.RedeemedCount + total, 0),
                    DeletedCount: g.values.reduce((total, val) => val.DeletedCount + total, 0),
                    NotFoundCount: g.values.reduce((total, val) => val.NotFoundCount + total, 0)
                }
            }));

        this.storeAllFields( "Yes" );
    }
}