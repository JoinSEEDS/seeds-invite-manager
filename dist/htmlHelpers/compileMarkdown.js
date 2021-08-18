"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileMarkdown = void 0;
var markdown_it_1 = __importDefault(require("markdown-it"));
function compileMarkdown(obj) {
    return new markdown_it_1.default().render(obj);
}
exports.compileMarkdown = compileMarkdown;
;
//# sourceMappingURL=compileMarkdown.js.map