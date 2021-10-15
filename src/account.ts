import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Knex from 'knex';
import knexConfig from './database/knexfile';
import fetch from 'node-fetch';
import { AuthToken } from "./models/AuthToken";
import { newResponse } from './infrastructure/seedsAuthenticator';


async function login(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const knex = Knex(knexConfig);
  
  console.log(process.env.AUTH_URL+'/api/v1/new');
  const response = await fetch(process.env.AUTH_URL+'/api/v1/new', { method: 'post', body:JSON.stringify({}), headers: {'Content-Type': 'application/json'} });
  //console.log(await response.text());
  const data = (await response.json() as newResponse).message;

  var authToken = new AuthToken({ 
      AuthId: data?.id,
      Policy:data?.policy,
      Signature:data?.signature,
      Token:data?.token,
      ValidUntil:data?.valid_until,
      Json: data
    });

  var itemId = await knex("AuthTokens").insert(authToken);
  console.log(itemId);
  return h.view("login",{ 
        authTokenId: authToken.Id,
        returnId: itemId
    });
}

export const accountRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/login",
    handler: login
  }
];
