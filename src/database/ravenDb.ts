import { DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery } from 'ravendb';
import * as dotenv from "dotenv";
import { AuthToken } from '../models/AuthToken'
import { InviteEvent } from '../models/InviteEvent'
import { SeedsInvite } from '../models/SeedsInvite';
import { InviteImport } from '../models/InviteImport';
import { SeedsInvites_All } from '../models/indexes/SeedsInvites_All';
import { init } from '../server';

dotenv.config({ path: '.env' });

if(process.env.DATABASE_URL == null){
  dotenv.config({ path: '../../.env' });
}

const store = new DocumentStore(process.env.RAVENDB_URL||'', process.env.RAVENDB_DATABASE||'');

store.conventions.registerEntityType(AuthToken);
store.conventions.registerEntityType(InviteEvent);
store.conventions.registerEntityType(SeedsInvite);
store.conventions.registerEntityType(InviteImport);
store.conventions.identityPartsSeparator = '-';
store.conventions.identityProperty = "Id";
store.initialize();

async function initIndexes() {    
  await store.executeIndex(new SeedsInvites_All());
}
initIndexes();

export { store as documentStore };