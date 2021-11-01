
'use strict';

import Hapi, { ServerRoute } from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import hapiVision from "@hapi/vision";
import hapiInert from "@hapi/inert";
import hapiCookie from "@hapi/cookie";

import { accountRoutes } from "./account";
import { helloRoutes } from "./hello";
import { peopleRoutes } from "./people";
import { campaignRoutes } from "./alliance";
import Airtable from "airtable";
import * as dotenv from "dotenv";
import { prefix } from './infrastructure/routeManager';
import { knex } from './infrastructure/knex';
import { AuthToken } from "./models/AuthToken";

dotenv.config({ path: '.env' });


export let server: Server;

export const init = async function(): Promise<Server> {

    Airtable.configure({ apiKey: process.env.AIRTABLE_APIKEY });

    server = Hapi.server({
        port: process.env.PORT || 4000,
        host: 'localhost',
        debug: { request: ['error'] }
    });

    await registerVision(server);
    await server.register(hapiInert);
    await server.register(hapiCookie);
    // Routes will go here
    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'sid-example',
            password: process.env.COOKIE_PASSWORD,
            isSecure: false
        },
        redirectTo: '/login',
        validateFunc: async (request, session: any) => {
            var authInfo = await knex<AuthToken>("AuthTokens").where( "Id", session.Id ).first();
            
            if (!authInfo?.IsSigned) {

                return { valid: false };
            }

            return { valid: true, credentials: { Id: authInfo?.Id } };
        }
    });

    server.auth.default('session');
    
    server.route({  
      method: 'GET',
      path: prefix('/assets/{file*}'),
      handler: {
        directory: { 
          path: 'assets'
        }
      },
      options: {
        auth: false
      }
    });
    
    server.route({
        method: "GET",
        path: prefix("/"),
        handler: index
    });

    var accR = setPrefix(accountRoutes);
    accR.forEach(route => {
      route.options = { auth: false };
    });
    server.route(accR);
    server.route(setPrefix(helloRoutes));
    server.route(setPrefix(peopleRoutes));
    server.route(setPrefix(campaignRoutes));

    return server;
};

function setPrefix(routes: ServerRoute[]){
  routes.forEach(route => {
    route.path = prefix(route.path);
  });
  return routes;
}

export const start = async function (): Promise<void> {
    console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
    return server.start();
};

async function registerVision(server: Server) {
    let cached: boolean;
  
    await server.register(hapiVision);
  
    if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
      cached = false;
    } else {
      cached = true;
    }
    server.log(["debug"], `Caching templates: ${cached}`);
    
    // var hbs = require("handlebars");
    // hbs.Handlebars.registerHelper('toJSON', function(obj: any) {
    //   return JSON.stringify(obj, null, 3);
    // });

    server.views({
      engines: {
        hbs: require("handlebars")
      },
      relativeTo: __dirname,
      path: './../templates',
      isCached: cached,
      layout: true,
      layoutPath: './../templates/layouts',
      partialsPath: './../templates/partials',
      helpersPath: './htmlHelpers/',
    });
  }

process.on('unhandledRejection', (err) => {
    console.error("unhandledRejection");
    console.error(err);
    process.exit(1);
});

function index(request: Request): string {
    console.log("Processing request", request.info.id);
    return "Hello! Random act of kindness.";
}