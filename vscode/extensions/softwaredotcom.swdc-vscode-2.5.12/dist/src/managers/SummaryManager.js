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
exports.SummaryManager = void 0;
const Util_1 = require("../Util");
const SessionSummaryData_1 = require("../storage/SessionSummaryData");
const StatusBarManager_1 = require("./StatusBarManager");
const TimeSummaryData_1 = require("../storage/TimeSummaryData");
const HttpClient_1 = require("../http/HttpClient");
const vscode_1 = require("vscode");
const date_fns_1 = require("date-fns");
class SummaryManager {
    constructor() {
        //
    }
    static getInstance() {
        if (!SummaryManager.instance) {
            SummaryManager.instance = new SummaryManager();
        }
        return SummaryManager.instance;
    }
    /**
     * This is only called from the new day checker
     */
    updateSessionSummaryFromServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const jwt = Util_1.getItem("jwt");
            const result = yield HttpClient_1.softwareGet(`/sessions/summary`, jwt);
            const nowDay = date_fns_1.format(new Date(), "MM/dd/yyyy");
            Util_1.setItem("updatedTreeDate", nowDay);
            if (HttpClient_1.isResponseOk(result) && result.data) {
                const existingSummary = SessionSummaryData_1.getSessionSummaryFileAsJson();
                const summary = result.data;
                // update summary current day values with the existing current day values
                summary.currentDayKeystrokes = Math.max(summary.currentDayKeystrokes, existingSummary.currentDayKeystrokes);
                summary.currentDayKpm = Math.max(summary.currentDayKpm, existingSummary.currentDayKpm);
                summary.currentDayLinesAdded = Math.max(summary.currentDayLinesAdded, existingSummary.currentDayLinesAdded);
                summary.currentDayLinesRemoved = Math.max(summary.currentDayLinesRemoved, existingSummary.currentDayLinesRemoved);
                summary.currentDayMinutes = Math.max(summary.currentDayMinutes, existingSummary.currentDayMinutes);
                TimeSummaryData_1.updateSessionAndEditorTime(summary.currentDayMinutes);
                SessionSummaryData_1.saveSessionSummaryToDisk(summary);
            }
            StatusBarManager_1.updateStatusBarWithSummaryData();
            // update the code time metrics tree views
            vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        });
    }
}
exports.SummaryManager = SummaryManager;
//# sourceMappingURL=SummaryManager.js.map