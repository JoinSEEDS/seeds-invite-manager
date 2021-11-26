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

    public constructor(init?:Partial<AuthToken>) {
        Object.assign(this, init);
    }
}