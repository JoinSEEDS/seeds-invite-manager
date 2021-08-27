"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRoutes = void 0;
var airtable_1 = __importDefault(require("airtable"));
var Campaign_1 = require("./models/Campaign");
var campaigns = [];
function syncCampaigns(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        var base;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    base = new airtable_1.default().base('appgpyECcHrR7yreI');
                    base('Campaign').select({
                        // Selecting the first 3 records in Grid view:
                        maxRecords: 30,
                        view: "Grid view"
                    }).eachPage(function page(records, fetchNextPage) {
                        // This function (`page`) will get called for each page of records.
                        records.forEach(function (record) {
                            var campaign = new Campaign_1.Campaign();
                            campaign.id = record.id;
                            Object.assign(campaign, record.fields);
                            var objIndex = campaigns.findIndex((function (obj) { return obj.id == campaign.id; }));
                            if (objIndex < 0) {
                                campaigns.push(campaign);
                            }
                            else {
                                campaigns[objIndex] = campaign;
                            }
                            console.log('Retrieved', record.get('Title'));
                        });
                        // To fetch the next page of records, call `fetchNextPage`.
                        // If there are more records, `page` will get called again.
                        // If there are no more records, `done` will get called.
                        fetchNextPage();
                    }, function done(err) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                    });
                    //return h.response("Records: " + campaigns.length);
                    //return h.view("people.hbs", { people: people });
                    return [4 /*yield*/, delay(2000)];
                case 1:
                    //return h.response("Records: " + campaigns.length);
                    //return h.view("people.hbs", { people: people });
                    _a.sent();
                    return [2 /*return*/, h.redirect("/network/campaigns")];
            }
        });
    });
}
function delay(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function jsonCampaigns(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, h.response(campaigns).type("application/json")];
        });
    });
}
function listCampaigns(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, h.view("campaigns", { campaigns: campaigns.sort(function (a, b) { return compare(a, b, "Proposal ID"); }).reverse() })];
        });
    });
}
function compare(a, b, fieldName) {
    if (a[fieldName] < b[fieldName]) {
        return -1;
    }
    if (a[fieldName] > b[fieldName]) {
        return 1;
    }
    return 0;
}
function campaignInfo(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        var campaign;
        return __generator(this, function (_a) {
            campaign = campaigns.find(function (el) { return el.id == request.params.id; });
            if (campaign == null) {
                return [2 /*return*/, h.response().code(404)];
            }
            return [2 /*return*/, h.view("campaignInfo", { campaign: campaign })];
        });
    });
}
exports.campaignRoutes = [
    { method: "GET", path: "/campaigns", handler: listCampaigns },
    { method: "GET", path: "/campaigns/info/{id}", handler: campaignInfo },
    { method: "GET", path: "/campaigns/sync", handler: syncCampaigns },
    { method: "GET", path: "/campaigns/json", handler: jsonCampaigns },
];
//# sourceMappingURL=alliance.js.map