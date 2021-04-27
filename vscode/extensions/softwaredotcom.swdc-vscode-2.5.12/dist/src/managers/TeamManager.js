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
exports.getCachedTeams = exports.getTeams = void 0;
const HttpClient_1 = require("../http/HttpClient");
const Util_1 = require("../Util");
let initializedCache = false;
let cachedTeams = [];
function getTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        initializedCache = true;
        cachedTeams = [];
        const resp = yield HttpClient_1.softwareGet("/teams", Util_1.getItem("jwt"));
        if (HttpClient_1.isResponseOk(resp)) {
            cachedTeams = resp.data;
        }
        return cachedTeams;
    });
}
exports.getTeams = getTeams;
function getCachedTeams() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!initializedCache) {
            return getTeams();
        }
        return cachedTeams;
    });
}
exports.getCachedTeams = getCachedTeams;
//# sourceMappingURL=TeamManager.js.map