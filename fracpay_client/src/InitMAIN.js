"use strict";
/****************************************************************
 * Fracpay client InitMAIN					*
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * InitMAIN creates a new operator.				*
 * One each of MAIN, self PIECE, self REF accounts are created.	*
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
var web3_js_1 = require("@solana/web3.js");
var utils_1 = require("./utils");
var utils_2 = require("./utils");
require("trace");
var Base58 = require("base-58");
Error.stackTraceLimit = Infinity;
/****************************************************************
 * main								*
 ****************************************************************/
var InitMAIN = function () { return __awaiter(void 0, void 0, void 0, function () {
    var operatorKEY, operatorID, countPIECE, countREF, _a, pdaMAIN, bumpMAIN, countPIECElow, countPIECEhigh, pdaPIECEseed, _b, pdaPIECE, bumpPIECE, countREFlow, countREFhigh, pdaREFseed, _c, pdaREF, bumpREF, operatorIDcheck, ixDATA, InitMAINtx, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _h.trys.push([0, 9, , 10]);
                operatorKEY = (0, utils_1.getKeypair)("operator");
                operatorID = "I AM AN OPERATOR ID";
                countPIECE = new Uint16Array(1);
                countPIECE[0] = 0;
                countREF = new Uint16Array(1);
                countREF[0] = 0;
                // setup
                return [4 /*yield*/, (0, utils_1.establishConnection)()];
            case 1:
                // setup
                _h.sent();
                return [4 /*yield*/, (0, utils_1.establishOperator)()];
            case 2:
                _h.sent();
                return [4 /*yield*/, (0, utils_1.checkProgram)()];
            case 3:
                _h.sent();
                return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([new Uint8Array((0, utils_1.toUTF8Array)(operatorID))], utils_2.fracpayID)];
            case 4:
                _a = _h.sent(), pdaMAIN = _a[0], bumpMAIN = _a[1];
                console.log(". MAIN pda:\t\t".concat(pdaMAIN.toBase58(), " found after ").concat(256 - bumpMAIN, " tries"));
                countPIECElow = countPIECE[0] & 0xFF;
                countPIECEhigh = (countPIECE[0] >> 8) & 0xFF;
                pdaPIECEseed = (0, utils_1.toUTF8Array)(pdaMAIN
                    .toString()
                    .slice(0, utils_2.PUBKEY_SIZE - utils_2.FLAGS_SIZE))
                    .concat(countPIECEhigh, countPIECElow);
                return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([new Uint8Array(pdaPIECEseed)], utils_2.fracpayID)];
            case 5:
                _b = _h.sent(), pdaPIECE = _b[0], bumpPIECE = _b[1];
                console.log(". Self PIECE pda:\t".concat(pdaPIECE.toBase58(), " found after ").concat(256 - bumpPIECE, " tries"));
                countREFlow = countREF[0] & 0xFF;
                countREFhigh = (countREF[0] >> 8) & 0xFF;
                pdaREFseed = (0, utils_1.toUTF8Array)(pdaPIECE
                    .toString()
                    .slice(0, 30))
                    .concat(countREFhigh, countREFlow);
                return [4 /*yield*/, web3_js_1.PublicKey.findProgramAddress([Buffer.from(new Uint8Array(pdaREFseed))], utils_2.fracpayID)];
            case 6:
                _c = _h.sent(), pdaREF = _c[0], bumpREF = _c[1];
                console.log(". Self REF pda:\t\t".concat(pdaREF.toBase58(), " found after ").concat(256 - bumpREF, " tries"));
                return [4 /*yield*/, utils_2.connection.getParsedProgramAccounts(utils_2.fracpayID, {
                        filters: [
                            {
                                dataSize: utils_2.PIECE_SIZE
                            },
                            {
                                memcmp: {
                                    offset: utils_2.FLAGS_SIZE +
                                        utils_2.PUBKEY_SIZE +
                                        utils_2.BALANCE_SIZE +
                                        utils_2.NETSUM_SIZE +
                                        utils_2.COUNT_SIZE,
                                    bytes: operatorID
                                }
                            },
                        ]
                    })];
            case 7:
                operatorIDcheck = _h.sent();
                if (operatorIDcheck) {
                    console.log("! The operator ID '".concat(operatorID, "' already has an account associated with it.\n"), "Choose a different ID for your operator account.");
                }
                ixDATA = [0, bumpMAIN, bumpPIECE, bumpREF]
                    .concat(pdaREFseed)
                    .concat(pdaPIECEseed)
                    .concat((0, utils_1.toUTF8Array)(operatorID));
                console.log("Buffer:");
                console.log(ixDATA);
                InitMAINtx = new web3_js_1.Transaction().add(new web3_js_1.TransactionInstruction({
                    keys: [
                        { pubkey: utils_2.operator.publicKey, isSigner: true, isWritable: true },
                        { pubkey: web3_js_1.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
                        { pubkey: pdaMAIN, isSigner: false, isWritable: true },
                        { pubkey: pdaPIECE, isSigner: false, isWritable: true },
                        { pubkey: pdaREF, isSigner: false, isWritable: true },
                        { pubkey: web3_js_1.SystemProgram.programId, isSigner: false, isWritable: false },
                    ],
                    data: Buffer.from(new Uint8Array(ixDATA)),
                    programId: utils_2.fracpayID
                }));
                _e = (_d = console).log;
                _f = "txhash: ".concat;
                return [4 /*yield*/, (0, web3_js_1.sendAndConfirmTransaction)(utils_2.connection, InitMAINtx, [utils_2.operator])];
            case 8:
                _e.apply(_d, [_f.apply("txhash: ", [_h.sent()])]);
                return [3 /*break*/, 10];
            case 9:
                _g = _h.sent();
                console.log(Error);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
InitMAIN();
