import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Knex from 'knex';
import knexConfig from './database/knexfile';
import fetch from 'node-fetch';
import { AuthToken } from "./models/AuthToken";
import { newResponse, qrResponse } from './infrastructure/seedsAuthenticator';


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
            device_id: token.Token,
            signature: token.Signature,
            backend_user_id: token.Token,
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
  }
];
