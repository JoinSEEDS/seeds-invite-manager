import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi"
import vision from "@hapi/vision";
import { IDocumentSession } from 'ravendb';
import { AuthToken } from '../models/AuthToken';

export class RequestHelper{
    public ravenSession: IDocumentSession
    public auth: AuthToken
    public id: string
    public baseUrl:string

    private request: Request;
    private response: ResponseToolkit;

    constructor(req: Request, res: ResponseToolkit){
        this.request = req;
        this.response = res;
        this.ravenSession = req.server.plugins.ravendb.session;
        this.id = req.params.id;
        this.baseUrl = `${req.headers['x-forwarded-proto'] || req.server.info.protocol}://${req.headers['x-forwarded-host'] || req.info.host}`;
        if(this.request.auth.isAuthenticated) {
            this.auth = <AuthToken><any>this.request.auth.credentials;
        }
    }

    view(templatePath: string, context?: any, options?: vision.ViewHandlerOrReplyOptions): ResponseObject{
        context.auth = this.auth;
        return this.response.view(templatePath,context,options);
    }
}