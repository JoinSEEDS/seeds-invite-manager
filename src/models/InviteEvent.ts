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

    public AvailableCount: number
    public SentCount: number
    public RedeemedCount: number 
    public DeletedAndNotFoundCount: number 

    public constructor(init?:Partial<InviteEvent>) {
        Object.assign(this, init);
        this.Slug = null;
    }
}

export enum InviteApp {
    Wallet = "Wallet",
    Passport = "Passport"
}

export enum InviteEventStatus{
    Inactive = "Inactive",
    Active = "Active"
}