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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeJsonData = exports.storeCurrentPayload = exports.getCurrentPayloadFile = exports.clearLastSavedKeystrokeStats = void 0;
const Util_1 = require("../Util");
const fileIt = require("file-it");
let latestPayload = null;
function clearLastSavedKeystrokeStats() {
    latestPayload = null;
}
exports.clearLastSavedKeystrokeStats = clearLastSavedKeystrokeStats;
function getCurrentPayloadFile() {
    let file = Util_1.getSoftwareDir();
    if (Util_1.isWindows()) {
        file += "\\latestKeystrokes.json";
    }
    else {
        file += "/latestKeystrokes.json";
    }
    return file;
}
exports.getCurrentPayloadFile = getCurrentPayloadFile;
function storeCurrentPayload(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        storeJsonData(this.getCurrentPayloadFile(), payload);
    });
}
exports.storeCurrentPayload = storeCurrentPayload;
function storeJsonData(fileName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        fileIt.writeJsonFileSync(fileName, data);
    });
}
exports.storeJsonData = storeJsonData;
//# sourceMappingURL=FileManager.js.map