export class SeedsInvite {
    public Id?: string|null = null
    public EventId:string|null = ''
    public AccountId: string = ''

    public Status: InviteStatus = InviteStatus.Available
    public Secret: string = ''
    
    public constructor(init?:Partial<SeedsInvite>) {
        Object.assign(this, init);
    }
}

enum InviteStatus{
    Available,
    Send,
    Redeemed
}