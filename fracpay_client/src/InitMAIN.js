"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
//import * as BufferLayout from "buffer-layout";
//import * as fs from "fs";
var fs = require("mz/fs");
var os = require("os");
var path = require("path");
var yaml = require("yaml");
var web3_js_1 = require("@solana/web3.js");
require("trace");
//require("crypto-js");
var Base58 = require("base-58");
Error.stackTraceLimit = Infinity;
// setup layouts and interface
//
/**
 * uint8, uint16, uint32 is already taken care of in Layout Module buffer-layout
 **/
/**
 * flags layout
 **/ /*
const flags = (property = "flags") => {
   return BufferLayout.blob(2, property);
};

/**
* public key layout
**/ /*
const publicKey = (property = "publicKey") => {
   return BufferLayout.blob(32, property);
};

/**
* pieceID layout
**/ /*
const pieceSlug = (property = "pieceSlug") => {
   return BufferLayout.blob(68, property);
};	// 64B String with 4B Vec tag

/**
* refSlug layout
**/ /*
const refSlug = (property = "refSlug") => {
   return BufferLayout.blob(20, property);
};	// 16B String with 4B Vec tag

/**
* u64 layout
**/ /*
const uint64 = (property = "uint64") => {
 return BufferLayout.blob(8, property);
};

/**
* sizes (because magic numbers are annoying)
**/
var FLAGS_SIZE = 2;
var PUBKEY_SIZE = 32;
var BALANCE_SIZE = 8;
var NETSUM_SIZE = 8;
var COUNT_SIZE = 4;
var PIECESLUG_SIZE = 67; // 63 + 4
var REFSLUG_SIZE = 20; // 16 + 4
var MAIN_SIZE = FLAGS_SIZE +
    PUBKEY_SIZE +
    BALANCE_SIZE +
    NETSUM_SIZE +
    COUNT_SIZE; // = 86
var PIECE_SIZE = FLAGS_SIZE +
    PUBKEY_SIZE +
    BALANCE_SIZE +
    NETSUM_SIZE +
    COUNT_SIZE +
    PIECESLUG_SIZE; // = 154
var REF_SIZE = FLAGS_SIZE +
    PUBKEY_SIZE +
    NETSUM_SIZE +
    COUNT_SIZE +
    REFSLUG_SIZE; // = 98
/**
 * account struct MAIN
 **/ /*

const MAIN_DATA_LAYOUT = BufferLayout.struct([
   BufferLayout.u8("flags"),
   publicKey("operator"),
   uint64("balance"),
   uint64("netsum"),
   BufferLayout.u32("piececount"),
]);
interface MAINlayout {
   flags: number;
   operator: Uint8Array;
   balance: Uint8Array;
   netsum: Uint8Array;
   piececount: number;
}

/**
* account struct PIECE
**/ /*
const PIECE_DATA_LAYOUT = BufferLayout.struct([
   BufferLayout.u8("flags"),
   publicKey("operator"),
   uint64("balance"),
   uint64("netsum"),
   BufferLayout.u32("refcount"),
   pieceSlug("pieceslug"),
]);
interface PIECElayout {
   flags: number;
       operator: Uint8Array;
   balance: Uint8Array;
   netsum: Uint8Array;
   refcount: number;
   pieceslug: Uint8Array;
}

/**
* account struct REF
**/ /*
const REF_DATA_LAYOUT = BufferLayout.struct([
   BufferLayout.u8("flags"),
   publicKey("target"),
   BufferLayout.u32("fract"),
   uint64("netsum"),
   refSlug("refslug"),
]);
interface REFlayout {
   flags: number;
       target: Uint8Array;
   fract: number;
   netsum: Uint8Array;
   refslug: Uint8Array;
};

/**
* main
**/
var connection;
var InitMAIN = function () { return __awaiter(void 0, void 0, void 0, function () {
    var fractipID, operatorKEY, operatorID, noPIECE, noREF, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                fractipID = getProgramID();
                operatorKEY = getKeypair("operator");
                operatorID = "TESTOPERATORID";
                noPIECE = new Uint16Array(1);
                noPIECE[0] = 256;
                noREF = new Uint16Array(1);
                noREF[0] = 65000;
                /**
             * Establish a connection to the cluster
             */
                return [4 /*yield*/, establishConnection()];
            case 1:
                /**
             * Establish a connection to the cluster
             */
                _b.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = _b.sent();
                console.log(Error);
                console.log(Error.prototype.stack);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
function establishConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var rpcUrl, version;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRpcUrl()];
                case 1:
                    rpcUrl = _a.sent();
                    connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
                    return [4 /*yield*/, connection.getVersion()];
                case 2:
                    version = _a.sent();
                    console.log('Connection to cluster established:', rpcUrl, version);
                    return [2 /*return*/];
            }
        });
    });
}
function getRpcUrl() {
    return __awaiter(this, void 0, void 0, function () {
        var config, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getConfig()];
                case 1:
                    config = _a.sent();
                    if (!config.json_rpc_url)
                        throw new Error('Missing RPC URL');
                    return [2 /*return*/, config.json_rpc_url];
                case 2:
                    err_1 = _a.sent();
                    console.warn('Failed to read RPC url from CLI config file, falling back to localhost');
                    return [2 /*return*/, 'http://localhost:8899'];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var CONFIG_FILE_PATH, configYml;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CONFIG_FILE_PATH = path.resolve(os.homedir(), '.config', 'solana', 'cli', 'config.yml');
                    return [4 /*yield*/, fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' })];
                case 1:
                    configYml = _a.sent();
                    return [2 /*return*/, yaml.parse(configYml)];
            }
        });
    });
}
////////////////////////////////////////////////////////////////
// takes in 64 byte array
var getPrivateKey = function (name) {
    return Uint8Array.from(JSON.parse(fs.readFileSync("./keys/".concat(name, "_pri.json"))));
};
// takes in base58 formatted string
var getPublicKey = function (name) {
    return new web3_js_1.PublicKey(JSON.parse(fs.readFileSync("./keys/".concat(name, "_pub.json"))));
};
var writePublicKey = function (publicKey, name) {
    fs.writeFileSync("./keys/".concat(name, "_pub.json"), JSON.stringify(publicKey.toString()));
};
// public key is 32 bytes, log printed as 64 hex characters
// private key is 64 bytes, log printerd as 64 byte array
var getKeypair = function (name) {
    return new web3_js_1.Keypair({
        publicKey: getPublicKey(name).toBytes(),
        secretKey: getPrivateKey(name)
    });
};
var getProgramID = function () {
    try {
        return getPublicKey("fractip");
    }
    catch (error) {
        console.log("Given programId is missing or incorrect");
        process.exit(1);
    }
};
InitMAIN();
function fromUTF8Array(data) {
    var str = '', i;
    for (i = 0; i < data.length; i++) {
        var value = data[i];
        if (value < 0x80) {
            str += String.fromCharCode(value);
        }
        else if (value > 0xBF && value < 0xE0) {
            str += String.fromCharCode((value & 0x1F) << 6 | data[i + 1] & 0x3F);
            i += 1;
        }
        else if (value > 0xDF && value < 0xF0) {
            str += String.fromCharCode((value & 0x0F) << 12 | (data[i + 1] & 0x3F) << 6 | data[i + 2] & 0x3F);
            i += 2;
        }
        else {
            // surrogate pair
            var charCode = ((value & 0x07) << 18 | (data[i + 1] & 0x3F) << 12 | (data[i + 2] & 0x3F) << 6 | data[i + 3] & 0x3F) - 0x010000;
            str += String.fromCharCode(charCode >> 10 | 0xD800, charCode & 0x03FF | 0xDC00);
            i += 3;
        }
    }
    return str;
}
function toUTF8Array(str) {
    var utf8 = [];
    for (var i = 0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80)
            utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            charcode = ((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff);
            utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
