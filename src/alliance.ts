import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import * as aData from './infrastructure/airtableData'

async function syncCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    
    aData.refreshCampaigns();

    aData.refreshOrganizations();

    await delay(1500);

    return h.redirect("/network/campaigns");
}


function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function jsonCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {

    return h.response(aData.campaigns).type("application/json");
}

async function listCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    if ( !aData.campaigns || aData.campaigns.length == 0 ) {
        aData.refreshCampaigns();
        aData.refreshOrganizations();
        await delay(1500);
    }
    
    var filtered = aData.campaigns.filter(item => item.VotingStatus != null );

    if(request.query.cycle) {
        filtered = filtered.filter(item=>item.ProposalCycle == request.query.cycle);
    }

    return h.view("campaigns",{ 
        campaigns: filtered.sort((a,b)=> compare(a,b,"ProposalID")).reverse(),
        sumSeeds: filtered.reduce((a, b) => a + b.SeedsRequested, 0),
        campaignsCount: filtered.length
    });
}

function compare( a: any, b: any, fieldName: string ) {
    if ( a[fieldName] < b[fieldName] ){
      return -1;
    }
    if ( a[fieldName] > b[fieldName] ){
      return 1;
    }
    return 0;
}

async function campaignInfo(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var campaign = aData.campaigns.find( (el) => el.ProposalID == request.params.id );

    if ( campaign == null ) {
        return h.response().code(404);
    }

    return h.view("campaignInfo",{ campaign });
}

async function orgInfo(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var organization = aData.organizations.find( (el) => el.SEEDSAccount == request.params.id );

    if ( organization == null ) {
        return h.response().code(404);
    }

    var filtered = aData.campaigns.filter( item => item.VotingStatus !=null && item.OrganizationAccount == request.params.id );

    return h.view("organizationInfo", 
    { organization, 
        campaigns: filtered, 
        sumSeeds: filtered.reduce((a, b) => a + b.SeedsRequested, 0),
        campaignsCount: filtered.length 
    });
}

export const campaignRoutes: ServerRoute[] = [
    { method: "GET", path: "/campaigns", handler: listCampaigns },
    { method: "GET", path: "/campaigns/info/{id}", handler: campaignInfo },
    { method: "GET", path: "/campaigns/sync", handler: syncCampaigns },
    { method: "GET", path: "/campaigns/json", handler: jsonCampaigns },
    { method: "GET", path: "/organizations/info/{id}", handler: orgInfo },
  ];