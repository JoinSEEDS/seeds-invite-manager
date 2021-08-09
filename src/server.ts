
'use strict';

import Hapi from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import hapiVision from "@hapi/vision";
import hapiInert from "@hapi/inert";

import { helloRoutes } from "./hello";
import { peopleRoutes } from "./people";
import { campaignRoutes } from "./alliance";
import Airtable from "airtable";


export let server: Server;

export const init = async function(): Promise<Server> {

    Airtable.configure({ apiKey: 'keyr1QkZKdenNFNR3' });

    

    server = Hapi.server({
        port: process.env.PORT || 4000,
        host: 'localhost',
        debug: { request: ['error'] }
    });

    await registerVision(server);
    await server.register(hapiInert);
    // Routes will go here


    server.route({  
      method: 'GET',
      path: '/assets/{file*}',
      handler: {
        directory: { 
          path: 'assets'
        }
      }
    });

    server.route({
        method: "GET",
        path: "/",
        handler: index
    });


    server.route(helloRoutes);
    server.route(peopleRoutes);
    server.route(campaignRoutes);

    return server;
};

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