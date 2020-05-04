// @ts-nocheck
import axios from 'axios';
import { URL } from 'url';
import * as grpc from 'grpc';

import * as services from 'tdex-protobuf/js/operator_grpc_pb';
import * as messages from 'tdex-protobuf/js/operator_pb';

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

export class OperatorClient {
  client: services.OperatorClient 
  constructor(endpoint) {
    this.client = new services.OperatorClient(
      endpoint,
      grpc.credentials.createInsecure()
    );
  }

  waitForReady(): Promise<any> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + 3);
      this.client.waitForReady(
        deadline,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  }

  feeDepositAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.feeDepositAddress(
        new messages.FeeDepositAddressRequest(),
        (err, response) => {
          if (err) return reject(err);
          resolve(response!.getAddress());
        }
      );
    });
  }

  depositAddress(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.depositAddress(
        new messages.DepositAddressRequest(),
        (err, response) => {
          if (err) return reject(err);
          resolve(response!.getAddress());
        }
      );
    });
  }

  feeBalance(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.feeBalance(
        new messages.FeeBalanceRequest(),
        (err, response) => {
          if (err) return reject(err);
          resolve(response!.getBalance());
        }
      );
    });
  }
}

