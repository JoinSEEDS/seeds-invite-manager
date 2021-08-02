
'use strict';

import Hapi from "@hapi/hapi";
import { Request, Server } from "@hapi/hapi";
import hapiVision from "@hapi/vision";

import { helloRoutes } from "./hello";
import { peopleRoutes } from "./people";


export let server: Server;

export const init = async function(): Promise<Server> {
    server = Hapi.server({
        port: process.env.PORT || 4000,
        host: 'localhost'
    });

    await registerVision(server);

    // Routes will go here

    server.route({
        method: "GET",
        path: "/",
        handler: index
    });

    server.route(helloRoutes);
    server.route(peopleRoutes);

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
    server.views({
      engines: {
        hbs: require("handlebars")
      },
      relativeTo: __dirname + "/../",
      path: 'templates',
      isCached: cached
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