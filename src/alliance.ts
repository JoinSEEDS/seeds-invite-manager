import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Airtable from "airtable";
import Handlebars from "handlebars";
import { Campaign } from './models/Campaign';


const campaigns:Campaign[] = [];

async function syncCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    
    var base = new Airtable().base('appgpyECcHrR7yreI');

    base('Campaign').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 3,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
    
        records.forEach(function(record) {
            var campaign = new Campaign();
            campaign.id = record.id;
            Object.assign(campaign,record.fields);
            
            var objIndex = campaigns.findIndex((obj => obj.id == campaign.id));
            if(objIndex<0){
                campaigns.push(campaign);
            } else {
                campaigns[objIndex] = campaign;
            }

            console.log('Retrieved', record.get('Title'));
        });
    
        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();
    
    }, function done(err) {
        if (err) { console.error(err); return; }
    });
    
    return h.response("Records: " + campaigns.length);
    //return h.view("people.hbs", { people: people });
}

async function jsonCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {

    return h.response(campaigns).type("application/json");
}

async function listCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {

    return h.view("campaigns",{ campaigns });
}

async function campaignInfo(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    var campaign = campaigns.find( (el) => el.id == request.params.id );

    if ( campaign == null ) {
        return h.response().code(404);
    }

    return h.view("campaignInfo",{ campaign });
}



export const campaignRoutes: ServerRoute[] = [
    { method: "GET", path: "/campaigns", handler: listCampaigns },
    { method: "GET", path: "/campaigns/info/{id}", handler: campaignInfo },
    { method: "GET", path: "/campaigns/sync", handler: syncCampaigns },
    { method: "GET", path: "/campaigns/json", handler: jsonCampaigns },
  ];