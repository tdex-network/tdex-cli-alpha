import * as fs from 'fs';
import { mergeDeep } from './helpers';

export interface StateInterface {
  state: StateObjectInterface,
  stateSerialized: String,
  path: String,
  set(newState: Object): void,
  get(): StateObjectInterface
}

export interface StateObjectInterface {
  network: StateNetworkInterface,
  provider: StateProviderInterface,
  market: StateMarketInterface,
  wallet: Object,
}

export interface StateProviderInterface {
  selected: Boolean,
  endpoint: String,
  pubkey: String,
  pairs: Array<string>
}

export interface StateMarketInterface {
  selected: Boolean,
  pair: String,
  price: Object
}

export interface StateNetworkInterface {
  selected: Boolean,
  chain: String
}

const initialState = {
  network: {
    selected: false,
    chain: ""
  },
  provider: {
    selected: false,
    endpoint: "",
    pubkey: "",
    pairs: []
  },
  market: {
    selected: false,
    pair: "",
    price: {
      timestamp: null,
      value: null
    }
  },
  wallet: {
    selected: false,
    keystore: {
      type:  "",
      value: ""
    }
  }
}

export default class State implements StateInterface {

  state: StateObjectInterface
  path: string
  stateSerialized: string

  constructor(args:any) {

    const { path } = args;

    if (fs.existsSync(path)) {
      const read = fs.readFileSync(path, 'utf8');
      this.stateSerialized = read;
      this.state = JSON.parse(read);
    } else {
      const serialized = JSON.stringify(initialState, undefined, 2)
      this.stateSerialized = serialized;
      this.state = initialState;
      fs.writeFileSync(path, serialized, { encoding:'utf8', flag:'w' })
    }

    this.path = path;
  }

  set(obj: Object): void {

    const currentState = this.get();

    const newState = mergeDeep(currentState, obj);

    this.state = newState;
    this.stateSerialized = JSON.stringify(newState, undefined, 2)
    fs.writeFileSync(this.path, this.stateSerialized, { encoding:'utf8', flag:'w' })
  }

  get(): StateObjectInterface {
    const read = fs.readFileSync(this.path, 'utf8');
    this.stateSerialized = read;
    this.state = JSON.parse(read);
    
    return this.state;
  }


}

