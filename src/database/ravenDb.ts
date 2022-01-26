import { DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery, IAuthOptions } from 'ravendb';
import * as dotenv from "dotenv";
import { AuthToken } from '../models/AuthToken'
import { InviteEvent } from '../models/InviteEvent'
import { SeedsInvite } from '../models/SeedsInvite';
import { InviteImport } from '../models/InviteImport';
import { SeedsInvites_All } from '../models/indexes/SeedsInvites_All';
import { init } from '../server';
import * as fs from "fs";
import { SeedsInvites_Stats } from '../models/indexes/SeedsInvites_Stats';

dotenv.config({ path: '.env' });

if(process.env.AUTH_URL == null){
  dotenv.config({ path: '../../.env' });
}

var authOptions:IAuthOptions = null;
if(process.env.RAVENDB_CERTIFICATE){
  authOptions = {
    certificate: fs.readFileSync(process.env.RAVENDB_CERTIFICATE),
    type: "pfx", // or "pem"
    password: ""
  };
}

const store = new DocumentStore(process.env.RAVENDB_URL||'', process.env.RAVENDB_DATABASE||'', authOptions);

store.conventions.registerEntityType(AuthToken);
store.conventions.registerEntityType(InviteEvent);
store.conventions.registerEntityType(SeedsInvite);
store.conventions.registerEntityType(InviteImport);
store.conventions.identityPartsSeparator = '-';
store.conventions.identityProperty = "Id";
store.initialize();

async function initIndexes() {    
  await store.executeIndex(new SeedsInvites_All());
  await store.executeIndex(new SeedsInvites_Stats()); 
}
initIndexes();

export { store as documentStore };