import fetch from 'node-fetch';
import eosjs from 'eosjs';

const ENDPOINT = `http://telos.caleos.io`;
const accountJoin = 'join.seeds';
const tableInvites = 'invites';
const keyType = "i64";


export async function GetInvitesForAccount(seedsAccount:string):Promise<any[]>{
    const rpc = new eosjs.JsonRpc(ENDPOINT, { fetch });
    
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