"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var handlebars_1 = __importDefault(require("handlebars"));
handlebars_1.default.registerHelper('toJSON', function (obj) {
    return JSON.stringify(obj, null, 3);
});
//# sourceMappingURL=common.js.map