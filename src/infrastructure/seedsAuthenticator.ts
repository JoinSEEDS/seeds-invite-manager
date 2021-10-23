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
export  {
    newToken,

}