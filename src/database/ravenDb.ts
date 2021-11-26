import { DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery } from 'ravendb';
import * as dotenv from "dotenv";
import { AuthToken } from '../models/AuthToken'

dotenv.config({ path: '.env' });

if(process.env.DATABASE_URL == null){
  dotenv.config({ path: '../../.env' });
}

const store = new DocumentStore(process.env.RAVENDB_URL||'', process.env.RAVENDB_DATABASE||'');

store.conventions.registerEntityType(AuthToken);
store.conventions.identityPartsSeparator = '-';
store.conventions.identityProperty = "Id";
store.initialize();

export { store as documentStore };