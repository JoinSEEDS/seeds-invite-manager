"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passedStatusColor = void 0;
function passedStatusColor(obj) {
    switch (obj) {
        case "Passed":
            return "success";
        default:
            return "secondary";
    }
}
exports.passedStatusColor = passedStatusColor;
;
//# sourceMappingURL=passedStatusColor.js.map