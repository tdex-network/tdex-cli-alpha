"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const helpers_1 = require("./helpers");
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
        pubkey: "",
        address: "",
        keystore: {
            type: "",
            value: ""
        }
    }
};
class State {
    constructor(args) {
        const { path } = args;
        if (fs.existsSync(path)) {
            const read = fs.readFileSync(path, 'utf8');
            this.stateSerialized = read;
            this.state = JSON.parse(read);
        }
        else {
            const serialized = JSON.stringify(initialState, undefined, 2);
            this.stateSerialized = serialized;
            this.state = initialState;
            fs.writeFileSync(path, serialized, { encoding: 'utf8', flag: 'w' });
        }
        this.path = path;
    }
    set(obj) {
        const currentState = this.get();
        const newState = helpers_1.mergeDeep(currentState, obj);
        this.state = newState;
        this.stateSerialized = JSON.stringify(newState, undefined, 2);
        fs.writeFileSync(this.path, this.stateSerialized, { encoding: 'utf8', flag: 'w' });
    }
    get() {
        const read = fs.readFileSync(this.path, 'utf8');
        this.stateSerialized = read;
        this.state = JSON.parse(read);
        return this.state;
    }
}
exports.default = State;
