export class InviteEvent {
    public Id: string|null = null
    public Name: string|null = ''
    public Date: Date | null = null
    public Slug: string|null = ''
    public Application:InviteApp = InviteApp.Wallet
    public AccountId: string = ''
    public Status:InviteEventStatus = InviteEventStatus.Inactive
    public Permalink: string
    public QRCode: string
    public CutoffDate: Date | null = null

    public ResetUnclaimedInvites: ResetUnclaimedInvites

    public AvailableCount: number
    public SentCount: number
    public RedeemedCount: number 
    public DeletedAndNotFoundCount: number 
    public AllCount: number

    public constructor(init?:Partial<InviteEvent>) {
        Object.assign(this, init);
        this.Slug = null;
    }

    
}

export enum InviteApp {
    Wallet = "Wallet",
    Passport = "Passport"
}

export enum ResetUnclaimedInvites{
    Never = "Never",
    After10Mins = "After10Mins",
    After15Mins = "After15Mins",
    After30Mins = "After30Mins",
    After60Mins = "After60Mins"
}

export enum InviteEventStatus{
    Inactive = "Inactive",
    Active = "Active"
}