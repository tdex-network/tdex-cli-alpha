import * as fs from 'fs';
import * as PathModule from 'path';
import { mergeDeep } from './helpers';

export interface StateInterface {
  state: StateObjectInterface,
  stateSerialized: string,
  path: string,
  set(newState: Object): void,
  get(): StateObjectInterface
}

export interface StateObjectInterface {
  network: StateNetworkInterface,
  provider: StateProviderInterface,
  market: StateMarketInterface,
  wallet: any,
}

export interface StateProviderInterface {
  selected: Boolean,
  endpoint: string,
  pubkey: string,
  markets: Object,
  pairs: Array<string>
}

export interface StateMarketInterface {
  selected: Boolean,
  pair: string,
  assets: Object
}

export interface StateNetworkInterface {
  selected: Boolean,
  chain: string,
  explorer: string
}

const initialState = {
  network: {
    selected: false,
    chain: "",
    explorer: ""
  },
  provider: {
    selected: false,
    endpoint: "",
    pubkey: "",
    markets: {},
    pairs: []
  },
  market: {
    selected: false,
    pair: "",
    assets: {}
  },
  wallet: {
    selected: false,
    pubkey: "",
    address: "",
    keystore: {
      type: "",
      value: ""
    }
  }
}

export default class State implements StateInterface {

  state: StateObjectInterface
  path: string
  stateSerialized: string

  constructor(args?: any) {

    let path;
    if (args && args.path) {
      if (!PathModule.isAbsolute(args.path))
        throw "Path must be absolute";
      path = args.path;
    } else {
      //Default relative position
      path = PathModule.resolve(__dirname, "../state.json");
    }


    if (fs.existsSync(path)) {
      const read = fs.readFileSync(path, 'utf8');
      this.stateSerialized = read;
      this.state = JSON.parse(read);
    } else {
      const serialized = JSON.stringify(initialState, undefined, 2)
      this.stateSerialized = serialized;
      this.state = initialState;
      fs.writeFileSync(path, serialized, { encoding: 'utf8', flag: 'w' })
    }

    this.path = path;
  }

  set(obj: Object): void {

    const currentState = this.get();

    const newState = mergeDeep(currentState, obj);

    this.state = newState;
    this.stateSerialized = JSON.stringify(newState, undefined, 2)
    fs.writeFileSync(this.path, this.stateSerialized, { encoding: 'utf8', flag: 'w' })
  }

  get(): StateObjectInterface {
    const read = fs.readFileSync(this.path, 'utf8');
    this.stateSerialized = read;
    this.state = JSON.parse(read);

    return this.state;
  }


}

