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
exports.peopleRoutes = void 0;
var joi_1 = __importDefault(require("joi"));
var ValidationError = joi_1.default.ValidationError;
var schema = joi_1.default.object({
    name: joi_1.default.string().required(),
    age: joi_1.default.number().required()
});
var people = [
    { name: "Sophie", age: 37 },
    { name: "Dan", age: 42 }
];
function showPeople(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, h.view("people.hbs", { people: people })];
        });
    });
}
function addPersonGet(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            data = {};
            return [2 /*return*/, h.view("addPerson", { person: data })];
        });
    });
}
function addPersonPost(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        var data, o, errors, _i, _a, detail;
        return __generator(this, function (_b) {
            data = {};
            console.log(request.payload);
            data = request.payload;
            console.log(data);
            o = schema.validate(data, { stripUnknown: true });
            if (o.error) {
                console.error(o.error);
                errors = {};
                if (o.error instanceof ValidationError && o.error.isJoi) {
                    for (_i = 0, _a = o.error.details; _i < _a.length; _i++) {
                        detail = _a[_i];
                        errors[detail.context.key] = detail.message;
                    }
                }
                else {
                    console.error("error", o.error, "adding person");
                }
                console.log("returning a view");
                return [2 /*return*/, h.view("addPerson", { person: data, errorsA: errors, errorsJSON: JSON.stringify(errors) })];
            }
            try {
                data = o.value;
                people.push(data);
                return [2 /*return*/, h.redirect("/people")];
            }
            catch (err) {
                console.error(err);
                throw err;
            }
            return [2 /*return*/];
        });
    });
}
function removePersonGet(request, h) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            people.splice(request.params.id);
            return [2 /*return*/, h.redirect("/people")];
        });
    });
}
exports.peopleRoutes = [
    { method: "GET", path: "/people", handler: showPeople },
    { method: "GET", path: "/people/add", handler: addPersonGet },
    { method: "POST", path: "/people/add", handler: addPersonPost },
    { method: "GET", path: "/people/remove/{id?}", handler: removePersonGet }
];
//# sourceMappingURL=people.js.map