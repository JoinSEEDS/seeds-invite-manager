import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Knex from 'knex';
import knexConfig from './database/knexfile';
import fetch from 'node-fetch';
import { AuthToken } from "./models/AuthToken";
import { checkResponse, newResponse, qrResponse } from './infrastructure/seedsAuthenticator';


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
  
  delete authToken.Id;
  authToken.Id = (await knex("AuthTokens").insert(authToken, "Id"))[0];
  console.log(authToken.Id);
  var qr = await getQR(authToken);

  return h.view("login",{ 
        authTokenId: authToken.Id,
        returnId: authToken.Id,
        qrUrl: qr.qr,
        esrUrl: qr.esr
    });
}

async function checkQr(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const knex = Knex(knexConfig);
  var authInfo = await knex<AuthToken>("AuthTokens").where( "Id", request.params.id ).first();

  var url = process.env.AUTH_URL+'/api/v1/check/' + authInfo?.AuthId;
  console.log(url);
  const response = await fetch(url, { 
      method: 'post', 
      body: JSON.stringify({
        token: authInfo?.Token
      }), 
      headers: {'Content-Type': 'application/json'} 
  });


  //console.log(await response.text());
  const data = (await response.json() as checkResponse).message;
  if ( response.ok ) {
    return h.response("ok");
  } else {
    if (response.status==404) {
      return h.response("refresh");
    }
    if (response.status==403) {
      return h.response("pending");
    }
    throw new RangeError(response.status.toString());
  }
}

async function loginWithAuth(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const knex = Knex(knexConfig);
  var authInfo = await knex.select<AuthToken>("AuthTokens").where( "id", request.params.id ).first();



  request.cookieAuth.set({ Id: authInfo?.Id });

  return h.redirect('/');
}

async function getQR( token: AuthToken ) : Promise<qrResponse> {
  var response = await fetch( `https://api-esr.hypha.earth/qr`, {
    method: "post",
    headers: {
      "user-agent": "bot-user-agent",
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      actions: [
        {
          account: 'policy.seeds',
          name: 'create',
          authorization: [
            {
              actor: "............1",
              permission: 'active'
            }
          ],
          data: {
            account: '............1',
            device_id: token.AuthId,
            signature: token.Signature,
            backend_user_id: token.AuthId,
            policy: token.Policy
          }
        }
      ]
    }) 
  });

  const data = (await response.json() as qrResponse);

  return data;
}

export const accountRoutes: ServerRoute[] = [
  {
    method: "GET",
    path: "/login",
    handler: login
  },
  {
    method: "GET",
    path: "/checkQr/{id}",
    handler: checkQr
  },
  {
    method: "GET",
    path: "/auth/{id}",
    handler: loginWithAuth
  }
];
