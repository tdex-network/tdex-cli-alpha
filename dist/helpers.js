"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const url_1 = require("url");
function isValidUrl(s) {
    try {
        new url_1.URL(s);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.isValidUrl = isValidUrl;
function mergeDeep(...objects) {
    const isObject = obj => obj && typeof obj === 'object';
    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach(key => {
            const pVal = prev[key];
            const oVal = obj[key];
            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = [...oVal];
            }
            else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = mergeDeep(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        });
        return prev;
    }, {});
}
exports.mergeDeep = mergeDeep;
