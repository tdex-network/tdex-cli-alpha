import * as fs from 'fs';
import * as os from 'os';
import * as PathModule from 'path';
import { mergeDeep } from './helpers';

export interface StateInterface {
  state: StateObjectInterface;
  stateSerialized: string;
  path: string;
  set(newState: Record<string, any>): void;
  get(): StateObjectInterface;
}

export interface StateObjectInterface {
  network: StateNetworkInterface;
  provider: StateProviderInterface;
  market: StateMarketInterface;
  wallet: any;
  operator: any;
}

export interface StateProviderInterface {
  selected: boolean;
  endpoint: string;
  pubkey: string;
  markets: Record<string, any>;
  pairs: Array<string>;
}

export interface StateMarketInterface {
  selected: boolean;
  pair: string;
  tickers: any;
  assets: any;
}

export interface StateNetworkInterface {
  selected: boolean;
  chain: string;
  explorer: string;
}

const initialState = {
  network: {
    selected: false,
    chain: '',
    explorer: '',
  },
  provider: {
    selected: false,
    endpoint: '',
    pubkey: '',
    markets: {},
    pairs: [],
  },
  market: {
    selected: false,
    pair: '',
    tickers: {},
    assets: {},
  },
  wallet: {
    selected: false,
    pubkey: '',
    address: '',
    script: '',
    keystore: {
      type: '',
      value: '',
    },
  },
  operator: {
    selected: false,
    endpoint: '',
    fees: [],
    markets: [] 
  }
};

export default class State implements StateInterface {
  state: StateObjectInterface;
  path: string;
  stateSerialized: string;

  constructor() {
    let path;
    const { TDEX_CLI_PATH } = process.env;
    if (TDEX_CLI_PATH) {
      if (!PathModule.isAbsolute(TDEX_CLI_PATH)) throw 'Path must be absolute';

      path = PathModule.resolve(TDEX_CLI_PATH, 'state.json');
    } else {
      //Default absolute position
      const homedir = os.homedir();
      const defaultPath = PathModule.resolve(homedir, '.tdex');
      if (!fs.existsSync(defaultPath)) {
        fs.mkdirSync(defaultPath);
      }

      path = PathModule.resolve(defaultPath, 'state.json');
    }

    if (fs.existsSync(path)) {
      const read = fs.readFileSync(path, 'utf8');
      this.stateSerialized = read;
      this.state = JSON.parse(read);
    } else {
      const serialized = JSON.stringify(initialState, undefined, 2);
      this.stateSerialized = serialized;
      this.state = initialState;
      fs.writeFileSync(path, serialized, { encoding: 'utf8', flag: 'w' });
    }

    this.path = path;
  }

  set(obj: Record<string, any>): void {
    const currentState = this.get();

    const newState = mergeDeep(currentState, obj);

    this.state = newState;
    this.stateSerialized = JSON.stringify(newState, undefined, 2);
    fs.writeFileSync(this.path, this.stateSerialized, {
      encoding: 'utf8',
      flag: 'w',
    });
  }

  get(): StateObjectInterface {
    const read = fs.readFileSync(this.path, 'utf8');
    this.stateSerialized = read;
    this.state = JSON.parse(read);

    return this.state;
  }
}
