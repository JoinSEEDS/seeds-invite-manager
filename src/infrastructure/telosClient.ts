import fetch from 'node-fetch';
import { JsonRpc } from 'eosjs';
import ecc from "eosjs-ecc";


const ENDPOINT = `http://telos.caleos.io`;
const accountJoin = 'join.seeds';
const tableInvites = 'invites';
const keyType = "i64";

export class SeedsInviteBlockchainInfo {
    invite_id: number
    transfer_quantity: string
    sow_quantity: string
    sponsor: string
    account: string
    invite_hash: string
    invite_secret: string
}


export async function GetInvitesForAccount(seedsAccount:string):Promise<SeedsInviteBlockchainInfo[]>{
    const rpc = new JsonRpc(ENDPOINT, { fetch });
    
    var result = await rpc.get_table_rows({
        json: true,
        code: accountJoin,
        scope: accountJoin,
        table: tableInvites,
        limit: 1000,
        index_position: 3,
        lower_bound: seedsAccount,
        upper_bound: seedsAccount,
        key_type: keyType
    });

    return result.rows;
}

export function GetHashFromSecret(inviteSecret:string):string{
    return ecc.sha256(fromHexString(inviteSecret)).toString('hex');
}

const fromHexString = (hexString: string) => new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))