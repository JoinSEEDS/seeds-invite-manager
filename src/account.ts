import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import { knex } from './infrastructure/knex';
import fetch from 'node-fetch'; 
import { Response as FetchResponse } from 'node-fetch'
import { AuthToken } from "./models/AuthToken";
import { checkResponse, newResponse, qrResponse } from './infrastructure/seedsAuthenticator';
import { IIdentifiable } from "./models/IIdentifiable";
import Boom from '@hapi/boom'


async function login(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
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
  var authInfo = await knex<AuthToken>("AuthTokens").where( "Id", request.params.id ).first();

  var response = await checkAuth(authInfo);

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

async function checkAuth(authToken:AuthToken|undefined): Promise<FetchResponse> {
  var url = process.env.AUTH_URL+'/api/v1/check/' + authToken?.AuthId;
  console.log(url);
  const response = await fetch(url, { 
      method: 'post', 
      body: JSON.stringify({
        token: authToken?.Token
      }), 
      headers: {'Content-Type': 'application/json'} 
  });

  //console.log(await response.text());
  const data = (await response.json() as checkResponse).message;
  return response;
}

async function auth(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  const input = <IIdentifiable>request.payload;
  var authInfo = await knex<AuthToken>("AuthTokens").where( "Id", input.id ).first();
  authInfo = authInfo ?? new AuthToken();
  if ( authInfo.IsSigned == true ) {
    throw Boom.unauthorized("token already used for authentication");    
  }
  var response = await checkAuth(authInfo);
  if ( response.ok ) {
    authInfo.IsSigned = true;
    await knex("AuthTokens").where({Id:authInfo.Id}).update({IsSigned:true});

    request.cookieAuth.set({ id: authInfo?.Id, Id: authInfo?.Id });
  }
  
  return h.redirect('/');
}

async function authTest(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  request.cookieAuth.set({ Id: "33" })
  
  return h.redirect('/');
}

async function authInfo(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  
  return h.response(request.auth.credentials);
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
    method: "POST",
    path: "/auth",
    handler: auth
  },
  {
    method: "GET",
    path: "/authtest",
    handler: authTest
  },
  {
    method: "GET",
    path: "/authInfo",
    handler: authInfo
  },
  
    {
    method: 'GET',
    path: '/logout',
    handler: (request, h) => {

        request.cookieAuth.clear();
        return h.redirect('/');
    }

}
];
