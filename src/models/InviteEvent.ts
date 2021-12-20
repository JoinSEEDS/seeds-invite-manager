export class InviteEvent {
    public Id: string|null = null
    public Name: string|null = ''
    public Date: Date | null = null
    public Slug: string|null = ''
    public Application:InviteApp = InviteApp.Wallet
    public AccountId: string = ''
    public Status:InviteEventStatus = InviteEventStatus.Inactive


    public constructor(init?:Partial<InviteEvent>) {
        Object.assign(this, init);
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