"use strict";
/****************************************************************
 * Fracpay client utility blob					*
 * blairmunroakusa@.0322.anch.AK				*
 ****************************************************************/
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
exports.REF_DATA_LAYOUT = exports.PIECE_DATA_LAYOUT = exports.MAIN_DATA_LAYOUT = exports.toUTF8Array = exports.fromUTF8Array = exports.getProgramID = exports.getKeypair = exports.establishOperator = exports.establishConnection = exports.checkProgram = exports.PROGRAM_KEYPAIR_PATH = exports.PROGRAM_PATH = exports.PROGRAM_KEYFILE = exports.fracpayID = exports.operator = exports.connection = exports.REF_SIZE = exports.PIECE_SIZE = exports.MAIN_SIZE = exports.REFSLUG_SIZE = exports.PIECESLUG_SIZE = exports.FRACT_SIZE = exports.COUNT_SIZE = exports.NETSUM_SIZE = exports.BALANCE_SIZE = exports.PUBKEY_SIZE = exports.FLAGS_SIZE = void 0;
/****************************************************************
 * imports							*
 ****************************************************************/
var web3_js_1 = require("@solana/web3.js");
var os = require("os");
var fs = require("mz/fs");
var path = require("path");
var yaml = require("yaml");
var BufferLayout = require("buffer-layout");
/****************************************************************
 * declare constants						*
 ****************************************************************/
exports.FLAGS_SIZE = 2;
exports.PUBKEY_SIZE = 32;
exports.BALANCE_SIZE = 8;
exports.NETSUM_SIZE = 8;
exports.COUNT_SIZE = 2;
exports.FRACT_SIZE = 4;
exports.PIECESLUG_SIZE = 67; // 63 + 4
exports.REFSLUG_SIZE = 20; // 16 + 4
exports.MAIN_SIZE = exports.FLAGS_SIZE +
    exports.PUBKEY_SIZE +
    exports.BALANCE_SIZE +
    exports.NETSUM_SIZE +
    exports.COUNT_SIZE; // = 52
exports.PIECE_SIZE = exports.FLAGS_SIZE +
    exports.PUBKEY_SIZE +
    exports.BALANCE_SIZE +
    exports.NETSUM_SIZE +
    exports.COUNT_SIZE +
    exports.PIECESLUG_SIZE; // = 119
exports.REF_SIZE = exports.FLAGS_SIZE +
    exports.PUBKEY_SIZE +
    exports.NETSUM_SIZE +
    exports.FRACT_SIZE +
    exports.REFSLUG_SIZE; // = 66
exports.PROGRAM_KEYFILE = "fracpay_server-keypair.json";
exports.PROGRAM_PATH = path.resolve("/Users/blairmunroakusa/_ROOT/___LEAF/fracpay/fracpay_server/target/deploy");
exports.PROGRAM_KEYPAIR_PATH = path.join(exports.PROGRAM_PATH, exports.PROGRAM_KEYFILE);
/****************************************************************
 * general functions						*
 ****************************************************************/
/**
* Check if the hello world BPF program has been deployed
**/
function checkProgram() {
    return __awaiter(this, void 0, void 0, function () {
        var programKeypair, err_1, errMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, createKeypairFromFile(exports.PROGRAM_KEYPAIR_PATH)];
                case 1:
                    programKeypair = _a.sent();
                    exports.fracpayID = programKeypair.publicKey;
                    console.log(". Fracpay found at:\t".concat(exports.fracpayID.toBase58()));
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    errMsg = err_1.message;
                    throw new Error("! Failed to read program keypair at \"".concat(exports.PROGRAM_KEYPAIR_PATH, "\" due to error: ").concat(errMsg, ".\n\n\t\t\tProgram may need to be deployed with \n\t\t\t`solana program deploy fracpay_server/target/deploy/fracpay_server.so`"));
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.checkProgram = checkProgram;
/**
 * establish connection
 **/
function establishConnection() {
    return __awaiter(this, void 0, void 0, function () {
        var rpcUrl, version;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getRpcUrl()];
                case 1:
                    rpcUrl = _a.sent();
                    exports.connection = new web3_js_1.Connection(rpcUrl, "confirmed");
                    return [4 /*yield*/, exports.connection.getVersion()];
                case 2:
                    version = _a.sent();
                    console.log(". Connection to cluster established:", rpcUrl, version);
                    return [2 /*return*/];
            }
        });
    });
}
exports.establishConnection = establishConnection;
function getRpcUrl() {
    return __awaiter(this, void 0, void 0, function () {
        var config, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getConfig()];
                case 1:
                    config = _a.sent();
                    if (!config.json_rpc_url)
                        throw new Error("Missing RPC URL");
                    return [2 /*return*/, config.json_rpc_url];
                case 2:
                    err_2 = _a.sent();
                    console.warn("! Failed to read RPC url from CLI config file, falling back to localhost");
                    return [2 /*return*/, "http://localhost:8899"];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * get operator's local solana config
 **/
function getConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var CONFIG_FILE_PATH, configYml;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    CONFIG_FILE_PATH = path.resolve(os.homedir(), ".config", "solana", "cli", "config.yml");
                    return [4 /*yield*/, fs.readFile(CONFIG_FILE_PATH, { encoding: "utf8" })];
                case 1:
                    configYml = _a.sent();
                    return [2 /*return*/, yaml.parse(configYml)];
            }
        });
    });
}
/**
 * establish operator
 **/
function establishOperator() {
    return __awaiter(this, void 0, void 0, function () {
        var fees, feeCalculator, _a, lamports;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fees = 0;
                    if (!!exports.operator) return [3 /*break*/, 4];
                    return [4 /*yield*/, exports.connection.getRecentBlockhash()];
                case 1:
                    feeCalculator = (_b.sent()).feeCalculator;
                    // Calculate the cost to fund the greeter account
                    _a = fees;
                    return [4 /*yield*/, exports.connection.getMinimumBalanceForRentExemption(exports.MAIN_SIZE + exports.PIECE_SIZE + exports.REF_SIZE)];
                case 2:
                    // Calculate the cost to fund the greeter account
                    fees = _a + _b.sent();
                    // Calculate the cost of sending transactions
                    fees += feeCalculator.lamportsPerSignature * 100; // wag
                    return [4 /*yield*/, getOperator()];
                case 3:
                    exports.operator = _b.sent();
                    _b.label = 4;
                case 4: return [4 /*yield*/, exports.connection.getBalance(exports.operator.publicKey)];
                case 5:
                    lamports = _b.sent();
                    if (lamports < fees) {
                        // If current balance is not enough to pay for fees, request an airdrop
                        console.log("! Unfortunately you do not have enough SOL to initialize an account.\n", "  You need ".concat(fees / web3_js_1.LAMPORTS_PER_SOL, " SOL to initialize account."));
                    }
                    console.log(". Operator account is:\t", exports.operator.publicKey.toBase58(), "containing", lamports / web3_js_1.LAMPORTS_PER_SOL, "SOL to pay for fees");
                    return [2 /*return*/];
            }
        });
    });
}
exports.establishOperator = establishOperator;
/**
 * setup operator as Keypair
 **/
function getOperator() {
    return __awaiter(this, void 0, void 0, function () {
        var config, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getConfig()];
                case 1:
                    config = _a.sent();
                    if (!config.keypair_path)
                        throw new Error("Missing keypair path");
                    return [4 /*yield*/, createKeypairFromFile(config.keypair_path)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_3 = _a.sent();
                    console.warn("! Failed to create keypair from CLI config file, falling back to new random keypair");
                    return [2 /*return*/, web3_js_1.Keypair.generate()];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * read secret key from file and return Keypair object
 **/
function createKeypairFromFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var secretKeyString, secretKey;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readFile(filePath, { encoding: "utf8" })];
                case 1:
                    secretKeyString = _a.sent();
                    secretKey = Uint8Array.from(JSON.parse(secretKeyString));
                    return [2 /*return*/, web3_js_1.Keypair.fromSecretKey(secretKey)];
            }
        });
    });
}
/**
 * return private key from 64 byte array in file
 **/
var getPrivateKey = function (name) {
    return Uint8Array.from(JSON.parse(fs.readFileSync("./keys/".concat(name, "_pri.json"))));
};
/**
 * return public key from base58 formatted string in file
 **/
var getPublicKey = function (name) {
    return new web3_js_1.PublicKey(JSON.parse(fs.readFileSync("./keys/".concat(name, "_pub.json"))));
};
/**
 * write a public key to file [presumably hex string, haven't checked yet]
 **/
var writePublicKey = function (publicKey, name) {
    fs.writeFileSync("./keys/".concat(name, "_pub.json"), JSON.stringify(publicKey.toString()));
};
/**
 * creates Keypair object from named pubkey prikey json files
 **/
var getKeypair = function (name) {
    return new web3_js_1.Keypair({
        publicKey: new Uint8Array(getPublicKey(name).toBytes()),
        secretKey: getPrivateKey(name)
    });
};
exports.getKeypair = getKeypair;
/**
 * read fracpay program ID from json file in keys directory
 **/
var getProgramID = function () {
    try {
        return getPublicKey("fracpay");
    }
    catch (error) {
        console.log("Given programId is missing or incorrect");
        process.exit(1);
    }
};
exports.getProgramID = getProgramID;
/**
 * take in a UTF8 array and turn it into a string
 **/
function fromUTF8Array(data) {
    var str = "";
    var i;
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
            var charCode = ((value & 0x07) << 18 |
                (data[i + 1] & 0x3F) << 12 |
                (data[i + 2] & 0x3F) << 6 |
                data[i + 3] & 0x3F) - 0x010000;
            str += String.fromCharCode(charCode >> 10 | 0xD800, charCode & 0x03FF | 0xDC00);
            i += 3;
        }
    }
    return str;
}
exports.fromUTF8Array = fromUTF8Array;
/**
 * take in a string and turn it into a UTF8 byte array
 **/
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
exports.toUTF8Array = toUTF8Array;
/****************************************************************
 * setup layouts and interfaces					*
 ****************************************************************/
/**
 * flags layout
 **/
var flags = function (property) {
    if (property === void 0) { property = "flags"; }
    return BufferLayout.blob(2, property);
};
/**
 * public key layout
 **/
var publicKey = function (property) {
    if (property === void 0) { property = "publicKey"; }
    return BufferLayout.blob(32, property);
};
/**
 * pieceID layout
 **/
var pieceSlug = function (property) {
    if (property === void 0) { property = "pieceSlug"; }
    return BufferLayout.blob(67, property);
}; // 63B String with 4B Vec tag
/**
 * refSlug layout
 **/
var refSlug = function (property) {
    if (property === void 0) { property = "refSlug"; }
    return BufferLayout.blob(20, property);
}; // 16B String with 4B Vec tag
/**
 * u64 layout
 **/
var uint64 = function (property) {
    if (property === void 0) { property = "uint64"; }
    return BufferLayout.blob(8, property);
};
/**
 * account struct MAIN
 **/
exports.MAIN_DATA_LAYOUT = BufferLayout.struct([
    BufferLayout.u16("flags"),
    publicKey("operator"),
    uint64("balance"),
    uint64("netsum"),
    BufferLayout.u16("piececount"),
]);
/**
 * account struct PIECE
 **/
exports.PIECE_DATA_LAYOUT = BufferLayout.struct([
    BufferLayout.u16("flags"),
    publicKey("operator"),
    uint64("balance"),
    uint64("netsum"),
    BufferLayout.u16("refcount"),
    pieceSlug("pieceslug"),
]);
/**
 * account struct REF
 **/
exports.REF_DATA_LAYOUT = BufferLayout.struct([
    BufferLayout.u16("flags"),
    publicKey("target"),
    BufferLayout.u32("fract"),
    uint64("netsum"),
    refSlug("refslug"),
]);
