export class SeedsInvite {
    public Id?: string|null = null
    public EventId:string|null = ''
    public AccountId: string = ''

    public Status: InviteStatus = InviteStatus.Available
    public Secret: string = ''
    public SentOn: Date|null = null
    
    public constructor(init?:Partial<SeedsInvite>) {
        Object.assign(this, init);
    }
}

export enum InviteStatus {
    Available = "Available",
    Sent = "Sent",
    Redeemed = "Redeemed"
}