import { string } from "joi"

export class InviteImport {
    public Id?: string|null
    public EventId:string|null = ''
    public AccountId: string = ''
    
    public ImportText: string = ''
    
    public SecretIdsImported: Array<string> = new Array<string>()

    public constructor(init?:Partial<InviteImport>) {
        Object.assign(this, init);
    }
}