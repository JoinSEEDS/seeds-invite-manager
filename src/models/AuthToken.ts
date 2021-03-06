export class AuthToken {
    public Id?: string|null
    public AuthId: string|null = ''
    public Policy: string = ''
    public Signature: string = ''
    public Token: string = ''
    public ValidUntil: number = 0
    public DateValidUntil: Date | null = null
    public IsSigned: boolean = false
    public Json: object | null = {}
    public AccountInfo: object | null = {}
    public SeedsAccount: string = ''
    public Nickname: string = ''
    public ProfilePicture: string = ''

    public constructor(init?:Partial<AuthToken>) {
        Object.assign(this, init);
    }
}