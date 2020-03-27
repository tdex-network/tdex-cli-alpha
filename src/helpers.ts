// @ts-nocheck
import { URL } from 'url';

export const NETWORKS = {
  "liquid" : "https://blockstream.info/liquid/api",
  "regtest": "https://nigiri.network/liquid/api"
}


export function isValidUrl(s) {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
}

export function mergeDeep(...objects) {
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


