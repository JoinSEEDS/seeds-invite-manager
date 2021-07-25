"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleProduct = void 0;
var SimpleProduct = /** @class */ (function () {
    function SimpleProduct(id, title) {
        if (id === void 0) { id = null; }
        if (title === void 0) { title = ''; }
        this.id = id;
        this.title = title;
    }
    return SimpleProduct;
}());
exports.SimpleProduct = SimpleProduct;
