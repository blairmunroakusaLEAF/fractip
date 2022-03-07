"use strict";
/****************************************************************
 * Fracpay client ListPIECE					*
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * List PIECE lists all pieces linked to MAIN account.		*
 * Pieces are listed numbered to make CLI piece selection easy.	*
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
var BigNumber = require("bignumber");
var web3_js_1 = require("@solana/web3.js");
var utils_1 = require("./utils");
var utils_2 = require("./utils");
/****************************************************************
 * main								*
 ****************************************************************/
var ListPIECE = function () { return __awaiter(void 0, void 0, void 0, function () {
    var operatorKEY, _a, pdaMAIN, bumpMAIN, MAINaccount, encodedMAINstate, decodedMAINstate, MAIN, countPIECE, countPIECElow, countPIECEhigh, pdaPIECEseed, _b, pdaPIECE, bumpPIECE, PIECEaccount, encodedPIECEstate, decodedPIECEstate, PIECE, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 11, , 12]);
                operatorKEY = (0, utils_1.getKeypair)("operator");
                // setup
                return [4 /*yield*/, (0, utils_1.establishConnection)()];
            case 1:
                // setup
                _d.sent();
                return [4 /*yield*/, (0, utils_1.establishOperator)()];
            case 2:
                _d.sent();
                return [4 /*yield*/, (0, utils_1.checkProgram)()];
            case 3:
                _d.sent();
                return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([new Uint8Array((0, utils_1.toUTF8Array)(utils_2.operatorID))], utils_2.fracpayID)];
            case 4:
                _a = _d.sent(), pdaMAIN = _a[0], bumpMAIN = _a[1];
                console.log(". Operator MAIN pda:\t\t".concat(pdaMAIN.toBase58(), " found after ").concat(256 - bumpMAIN, " tries"));
                return [4 /*yield*/, utils_2.connection.getAccountInfo(pdaMAIN)];
            case 5:
                MAINaccount = _d.sent();
                if (MAINaccount === null || MAINaccount.data.length === 0) {
                    console.log("! MAIN account for this operator ID has not been initialized. Nothing to list.");
                    process.exit(1);
                }
                encodedMAINstate = MAINaccount.data;
                decodedMAINstate = utils_2.MAIN_DATA_LAYOUT.decode(encodedMAINstate);
                MAIN = {
                    flags: decodedMAINstate.flags,
                    operator: new web3_js_1.PublicKey(decodedMAINstate.operator),
                    balance: new BigNumber("0x" + decodedMAINstate.balance.toString("hex")),
                    netsum: new BigNumber("0x" + decodedMAINstate.netsum.toString("hex")),
                    piececount: decodedMAINstate.piececount
                };
                console.log(". Listing ".concat(countPIECE[0], " pieces associated with '").concat(utils_2.operatorID, "' MAIN account."));
                console.log("\nPIECE#\tPIECE ID");
                countPIECE = new Uint16Array(1);
                countPIECE[0] = 0;
                _d.label = 6;
            case 6:
                if (!(countPIECE[0] <= MAIN.piececount)) return [3 /*break*/, 10];
                countPIECElow = countPIECE[0] & 0xFF;
                countPIECEhigh = (countPIECE[0] >> 8) & 0xFF;
                pdaPIECEseed = (0, utils_1.toUTF8Array)(pdaMAIN
                    .toString()
                    .slice(0, utils_2.PUBKEY_SIZE - utils_2.COUNT_SIZE))
                    .concat(countPIECEhigh, countPIECElow);
                return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([new Uint8Array(pdaPIECEseed)], utils_2.fracpayID)];
            case 7:
                _b = _d.sent(), pdaPIECE = _b[0], bumpPIECE = _b[1];
                return [4 /*yield*/, utils_2.connection.getAccountInfo(pdaPIECE)];
            case 8:
                PIECEaccount = _d.sent();
                encodedPIECEstate = PIECEaccount.data;
                decodedPIECEstate = utils_2.PIECE_DATA_LAYOUT.decode(encodedPIECEstate);
                PIECE = {
                    flags: decodedPIECEstate.flags,
                    operator: new web3_js_1.PublicKey(decodedPIECEstate.operator),
                    balance: new BigNumber("0x" + decodedPIECEstate.balance.toString("hex")),
                    netsum: new BigNumber("0x" + decodedPIECEstate.netsum.toString("hex")),
                    refcount: decodedPIECEstate.refcount,
                    pieceslug: decodedPIECEstate.pieceslug.toString()
                };
                console.log("# ".concat(countPIECE[0], "\t").concat(PIECE.pieceslug));
                _d.label = 9;
            case 9:
                countPIECE[0]++;
                return [3 /*break*/, 6];
            case 10: return [3 /*break*/, 12];
            case 11:
                _c = _d.sent();
                console.log(Error);
                console.log(Error.prototype.stack);
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); };
ListPIECE();
