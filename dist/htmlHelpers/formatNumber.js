"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = void 0;
/**
 * An Handlebars helper to format numbers
 *
 * This helper have these three optional parameters:
 *  @var decimalLength int The length of the decimals
 *  @var thousandsSep char The thousands separator
 *  @var decimalSep char The decimals separator
 *
 * Based on:
 *  - mu is too short: http://stackoverflow.com/a/14493552/369867
 *  - VisioN: http://stackoverflow.com/a/14428340/369867
 *
 * Demo: http://jsfiddle.net/DennyLoko/6sR87/
 */
function formatNumber(value, options) {
    if (!value) {
        return '-';
    }
    // Helper parameters
    var dl = options.hash['decimalLength'] || 2;
    var ts = options.hash['thousandsSep'] || ',';
    var ds = options.hash['decimalSep'] || '.';
    // Parse to float
    var valueNum = value; //parseFloat(value);
    // The regex
    var re = '\\d(?=(\\d{3})+' + (dl > 0 ? '\\D' : '$') + ')';
    // Formats the number with the decimals
    var num = valueNum.toFixed(Math.max(0, ~~dl));
    // Returns the formatted number
    return (ds ? num.replace('.', ds) : num).replace(new RegExp(re, 'g'), '$&' + ts);
}
exports.formatNumber = formatNumber;
//# sourceMappingURL=formatNumber.js.map