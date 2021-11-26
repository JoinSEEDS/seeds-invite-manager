import fetch from 'node-fetch';

async function newToken(){
    const response = await fetch(process.env.AUTH_URL+'/new', { method: 'POST' });
    const data = await response.json();
    
    return data;
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

export  {
    newToken,

}