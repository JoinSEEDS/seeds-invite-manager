import { Request, ResponseToolkit, ResponseObject, ServerRoute } from "@hapi/hapi";
import Airtable from "airtable";
import Handlebars from "handlebars";
import { Campaign } from './models/Campaign';
import { IIndexable } from "./models/IIndexable";


const campaigns:Campaign[] = [];

async function syncCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    
    refreshFromAirtable();

    await delay(1500);

    return h.redirect("/network/campaigns");
}

function refreshFromAirtable(){
    var base = new Airtable().base('appgpyECcHrR7yreI');

    base('Campaign').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 30,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record) {
            var campaign = new Campaign();
            campaign.id = record.id;
            Object.assign(campaign, record.fields);

            Object.keys(campaign).forEach(function(key) {
                var indexable = campaign as IIndexable;
                // Copy the value
                var val = indexable[key],
                  newKey = key.replace(/\s+/g, '');
                
                // Remove key-value from object
                delete indexable[key];
            
                // Add value with new key
                indexable[newKey] = val;
              });

            var objIndex = campaigns.findIndex((obj => obj.id == campaign.id));
            if (objIndex < 0) {
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
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function jsonCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {

    return h.response(campaigns).type("application/json");
}

async function listCampaigns(request: Request, h: ResponseToolkit): Promise<ResponseObject> {
    if ( !campaigns || campaigns.length == 0 ) {
        refreshFromAirtable();
        await delay(1500);
    }
    
    var filtered = campaigns.filter(item => item.VotingStatus == "Passed");

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