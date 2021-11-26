import { DocumentStore, IDocumentStore, IDocumentSession, IDocumentQuery } from 'ravendb';

declare module '@hapi/hapi' {
    export interface PluginProperties {
        ravendb:{
            session: IDocumentSession; // TODO define
        }
    }
  }