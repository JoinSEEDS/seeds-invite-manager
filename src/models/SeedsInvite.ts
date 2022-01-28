import { number } from "joi"

export class SeedsInvite {
    public Id?: string|null = null
    public EventId:string|null = ''
    public AccountId: string = ''

    public Status: InviteStatus = InviteStatus.Available
    public Secret: string = ''
    public SentOn: Date|null = null
    public Hash: string = ''
    public RedeemedAccount: string
    public SowQuantityString: string
    public TransferQuantityString: string
    public SowQuantity: number
    public TransferQuantity: number
    
    public WalletDynamicLink:string
    public WalletDynamicLinkInfo:object

    public constructor(init?:Partial<SeedsInvite>) {
        Object.assign(this, init);
    }

    public ParseQuantities():void {
        if(this.SowQuantityString!=null){
            this.SowQuantity = Number(this.SowQuantityString.replace("SEEDS",""));
        }
        if(this.TransferQuantityString!=null){
            this.TransferQuantity = Number(this.TransferQuantityString.replace("SEEDS",""));
        }
    }
}

export enum InviteStatus {
    Available = "Available",
    Sent = "Sent",
    Redeemed = "Redeemed"
}