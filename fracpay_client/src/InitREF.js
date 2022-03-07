"use strict";
/****************************************************************
 * Fracpay client InitREF					*
 * blairmunroakusa@.0322.anch.AK				*
 *								*
 * InitREF creates a new reference.				*
 * One uninitialized REF account is created.			*
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
/*
 * INCOMPLETE--NEED TO DIAL IN InitPIECE FIRST
 * . NEED TO CREATE ListPIECE CLIENT FUNCTION
 * . NEED TO CREATE ChoosePIECE CLIENT FUNCTION
 * . NEED TO CREATE TEST ACCOUNT WITH MULTIPLE EMPTY PIECES

/****************************************************************
 * imports							*
 ****************************************************************/
var prompt = require("prompt-sync")({ sigint: true });
var lodash = require("lodash");
var utils_1 = require("./utils");
/****************************************************************
 * main								*
 ****************************************************************/
var InitREF = function () { return __awaiter(void 0, void 0, void 0, function () {
    var operatorID, _a, pdaMAIN, bumpMAIN, MAIN, operatorID, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 7, , 8]);
                // setup
                return [4 /*yield*/, (0, utils_1.establishConnection)()];
            case 1:
                // setup
                _c.sent();
                return [4 /*yield*/, (0, utils_1.establishOperator)()];
            case 2:
                _c.sent();
                return [4 /*yield*/, (0, utils_1.checkProgram)()];
            case 3:
                _c.sent();
                operatorID = prompt("Please enter your operator ID: ");
                return [4 /*yield*/, deriveAddress((0, utils_1.toUTF8Array)(operatorID))];
            case 4:
                _a = _c.sent(), pdaMAIN = _a[0], bumpMAIN = _a[1];
                console.log(". Operator MAIN pda:\t".concat(pdaMAIN.toBase58(), " found after ").concat(256 - bumpMAIN, " tries"));
                return [4 /*yield*/, getMAINdata(pdaMAIN)];
            case 5:
                MAIN = _c.sent();
                // check to make sure operator has right account
                if (!lodash.isEqual(operatorKEY.publicKey, MAIN.operator)) {
                    console.log("! You don't have the right wallet to add pieces to this account.", " Check to see if you have the right Operator ID, or wallet pubkey.");
                    process.exit(1);
                }
                // state intention
                console.log(". Listing ".concat(MAIN.piececount, " pieces associated with '").concat(operatorID, "' MAIN account.\n"), "\nPIECE\n");
                // print PIECE list
                return [4 /*yield*/, (0, utils_1.printPIECElist)(pdaMAIN, MAIN.piececount)];
            case 6:
                // print PIECE list
                _c.sent();
                operatorID = prompt("From the PIECE list, please enter # or SELF to add REF to: ");
                return [3 /*break*/, 8];
            case 7:
                _b = _c.sent();
                console.log(Error);
                console.log(Error.prototype.stack);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
InitREF();
