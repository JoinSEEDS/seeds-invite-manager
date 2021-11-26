export class InviteEvent {
    public Id: string|null = null
    public Name: string|null = ''
    public Date: Date | null = null
    public Slug: string|null = ''
    public AccountId: string|null = ''

    public constructor(init?:Partial<InviteEvent>) {
        Object.assign(this, init);
    }
}