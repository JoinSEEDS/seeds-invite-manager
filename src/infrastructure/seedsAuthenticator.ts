import { AuthToken } from "../models/AuthToken";
import fetch from 'node-fetch'; 
import { Response } from 'node-fetch'

export async function checkAuth(authToken:AuthToken|undefined): Promise<Response> {
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

  

export async function getAccountInfo(authToken:AuthToken|undefined): Promise<infoResponse> {
    var url = process.env.AUTH_URL+'/api/v1/info/' + authToken?.AuthId;
    console.log(url);
    const response = await fetch(url, { 
        method: 'post', 
        body: JSON.stringify({
          token: authToken?.Token
        }), 
        headers: {'Content-Type': 'application/json'} 
    });
  
    //console.log(await response.text());
    const data = (await response.json() as infoResponse);
    return data;
}


export async function createNewAuth() : Promise<newMessage> {
    console.log(process.env.AUTH_URL+'/api/v1/new');
    var response = await fetch(process.env.AUTH_URL+'/api/v1/new', { method: 'post', body:JSON.stringify({}), headers: {'Content-Type': 'application/json'} });
    return (await response.json() as newResponse).message;
}

export class qrResponse {
    public esr?:string
    public qr?:string
}

export class newResponse {
    public message: newMessage | null = null
}

class newMessage{
    public id: string = ''
    public policy: string = ''
    public signature: string = ''
    public token: string = ''
    public valid_until: number = 0
}

export class checkResponse {
    public message: string | null = null
}

export class infoResponse {
    public account: string = ''
    public image: string = ''
    public nickname: string = ''
    public reputation: number = 0
    public roles: string = ''
    public skills: string = ''
    public status: string = ''
    public story: string = ''
    public timestamp: number = 0
    public type: string = ''
}
