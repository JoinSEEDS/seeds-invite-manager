import Hapi, { ServerRoute } from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import './extensions'
import { documentStore } from "../database/ravenDb"

export default {
    name: 'ravendb',
    register: function (server:Hapi.Server, options: any) {

        server.ext('onPreAuth', function(request, h){
            //console.log('inside onPreAuth');
            if (request.path.startsWith('/assets')) {
                return h.continue;
            }
            server.expose("session", documentStore.openSession());
            return h.continue;
        });
    
        // server.ext('onPreHandler', async function(request, h){
        //     console.log('inside onPreHandler');
        //     //console.log(request.server.plugins.ravenHandler.ravenSession);
        //     return h.continue;
        // });

        server.ext('onPostHandler', async function(request, h){
            //console.log('inside onPostHandler');
            if (request.path.startsWith('/assets')) {
                return h.continue;
            }
            var ravenSession = request.server.plugins.ravendb.session;
            if ( ravenSession.advanced.hasChanges() ){
                await ravenSession.saveChanges();
            }
            ravenSession.dispose();
            //console.log(request.server.plugins.ravenHandler.ravenSession);
            return h.continue;
        });
    }
}
