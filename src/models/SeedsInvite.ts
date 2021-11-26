export class SeedsInvite {
    public Id?: string|null
    public InviteEventId:string|null = ''
    public Secret: string = ''
    public AccountId: string = ''

    public constructor(init?:Partial<SeedsInvite>) {
        Object.assign(this, init);
    }
}