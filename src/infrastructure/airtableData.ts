import Airtable from "airtable";
import { AirtableBase } from "airtable/lib/airtable_base";
import { FieldSet } from "airtable/lib/field_set";
import { Records } from "airtable/lib/records";
import { func } from "joi";
import { Campaign } from "../models/Campaign";
import { IIdentifiable } from "../models/IIdentifiable";
import { IIndexable } from "../models/IIndexable";
import { Organization } from "../models/Organization";

export const campaigns:Campaign[] = [];
export const organizations:Organization[] = [];
var base: AirtableBase;

function initBase(){
    if (!base) {
        base = new Airtable().base('appgpyECcHrR7yreI');
    }
}

export async function refreshOrganizations(){
    initBase();

    base('Organization').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 200,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record) {
            var organization = new Organization();
            
            syncEntityData(organization,record,organizations);
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }

    });
}

function syncEntityData<T extends IIdentifiable>(entity:T, record:any, array:T[]) {
    entity.id = record.id;
    Object.assign(entity, record.fields);

    Object.keys(entity).forEach(function(key) {
        var indexable = entity as IIndexable;
        // Copy the value
        var val = indexable[key],
            newKey = key.replace(/\s+/g, '');
        
        // Remove key-value from object
        delete indexable[key];
    
        // Add value with new key
        indexable[newKey] = val;
        });

    var objIndex = array.findIndex((obj => obj.id == entity.id));
    if (objIndex < 0) {
        array.push(entity);
    } else {
        array[objIndex] = entity;
    }

    console.log('Retrieved', record.get('Title'));
}

export async function refreshCampaigns(){
    initBase();

    base('Campaign').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 200,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(function (record) {
            var campaign = new Campaign();

            syncEntityData(campaign,record,campaigns);
        });

        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) { console.error(err); return; }

    });
}

// export class airtableData {
//     refreshFromAirtable: any
//     campaigns: any
// }