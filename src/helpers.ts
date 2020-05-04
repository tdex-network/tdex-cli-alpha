// @ts-nocheck
import axios from 'axios';
import { URL } from 'url';

export const NETWORKS = {
  liquid: 'https://blockstream.info/liquid/api',
  regtest: 'https://nigiri.network/liquid/api',
};

export const TAXI_API_URL = {
  liquid: 'https://liquid-taxi.herokuapp.com',
  regtest: 'https://liquid-taxi.herokuapp.com',
};

export function toSatoshi(x: number): number {
  return Math.floor(x * Math.pow(10, 8));
}

export function fromSatoshi(x: number): number {
  return Number(
    (x / Math.pow(10, 8))
      .toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8,
      })
      .replace(',', '')
  );
}

export async function tickersFromMarkets(
  markets: Array<any>,
  url: string
): Promise<any> {
  const marketsByTicker: any = {};
  const fetchTicker = async (asset: string, url: string): Promise<any> => {
    try {
      const res = await axios.get(`${url}/asset/${asset}`);
      return res.data.ticker;
    } catch (ignore) {
      return undefined;
    }
  };
  let baseAssetTicker: string;

  for (let i = 0; i < markets.length; ++i) {
    const { baseAsset, quoteAsset } = markets[i];
    const previewLength = 4;
    if (!baseAssetTicker) {
      const ticker = await fetchTicker(baseAsset, url);
      baseAssetTicker = ticker || baseAsset.substring(0, previewLength);
    }
    const ticker = await fetchTicker(quoteAsset, url);
    const quoteAssetTicker = ticker || quoteAsset.substring(0, previewLength);
    const pair = `${baseAssetTicker}-${quoteAssetTicker}`;
    marketsByTicker[pair] = {
      [baseAssetTicker]: baseAsset,
      [quoteAssetTicker]: quoteAsset,
    };
  }
  return marketsByTicker;
}

export function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
  const isObject = (obj) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = [...oVal];
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });

    return prev;
  }, {});
}
