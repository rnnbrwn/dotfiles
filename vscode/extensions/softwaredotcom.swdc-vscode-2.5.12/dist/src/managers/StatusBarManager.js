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
exports.updateStatusBarWithSummaryData = exports.isStatusBarTextVisible = exports.toggleStatusBar = exports.updateFlowModeStatus = exports.initializeStatusBar = void 0;
const vscode_1 = require("vscode");
const models_1 = require("../model/models");
const Util_1 = require("../Util");
const FlowManager_1 = require("./FlowManager");
let showStatusBarText = true;
let ctMetricStatusBarItem = undefined;
let ctFlowModeStatusBarItem = undefined;
function initializeStatusBar() {
    return __awaiter(this, void 0, void 0, function* () {
        ctMetricStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 10);
        // add the name to the tooltip if we have it
        const name = Util_1.getItem("name");
        let tooltip = "Click to see more from Code Time";
        if (name) {
            tooltip = `${tooltip} (${name})`;
        }
        ctMetricStatusBarItem.tooltip = tooltip;
        ctMetricStatusBarItem.command = "codetime.displaySidebar";
        ctMetricStatusBarItem.show();
        ctFlowModeStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 9);
        yield updateFlowModeStatus();
    });
}
exports.initializeStatusBar = initializeStatusBar;
function updateFlowModeStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        const { flowModeCommand, flowModeText, flowModeTooltip } = yield getFlowModeStatusBarInfo();
        ctFlowModeStatusBarItem.command = flowModeCommand;
        ctFlowModeStatusBarItem.text = flowModeText;
        ctFlowModeStatusBarItem.tooltip = flowModeTooltip;
        if (isRegistered()) {
            ctFlowModeStatusBarItem.show();
        }
        else {
            ctFlowModeStatusBarItem.hide();
        }
    });
}
exports.updateFlowModeStatus = updateFlowModeStatus;
function getFlowModeStatusBarInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        let flowModeCommand = "codetime.enableFlow";
        let flowModeText = "$(circle-large-outline) Flow";
        let flowModeTooltip = "Enter Flow Mode";
        if (yield FlowManager_1.isFlowModEnabled()) {
            flowModeCommand = "codetime.exitFlowMode";
            flowModeText = "$(circle-large-filled) Flow";
            flowModeTooltip = "Exit Flow Mode";
        }
        return { flowModeCommand, flowModeText, flowModeTooltip };
    });
}
function toggleStatusBar() {
    showStatusBarText = !showStatusBarText;
    // toggle the flow mode
    if (showStatusBarText && isRegistered()) {
        ctFlowModeStatusBarItem.show();
    }
    else if (!showStatusBarText) {
        ctFlowModeStatusBarItem.hide();
    }
    // toggle the metrics value
    updateStatusBarWithSummaryData();
}
exports.toggleStatusBar = toggleStatusBar;
function isStatusBarTextVisible() {
    return showStatusBarText;
}
exports.isStatusBarTextVisible = isStatusBarTextVisible;
function isRegistered() {
    return !!Util_1.getItem("name");
}
/**
 * Updates the status bar text with the current day minutes (session minutes)
 */
function updateStatusBarWithSummaryData() {
    let sessionSummary = Util_1.getFileDataAsJson(Util_1.getSessionSummaryFile());
    if (!sessionSummary) {
        sessionSummary = new models_1.SessionSummary();
    }
    const inFlowIcon = sessionSummary.currentDayMinutes > sessionSummary.averageDailyMinutes ? "$(rocket)" : "$(clock)";
    const minutesStr = Util_1.humanizeMinutes(sessionSummary.currentDayMinutes);
    const msg = `${inFlowIcon} ${minutesStr}`;
    showStatus(msg, null);
}
exports.updateStatusBarWithSummaryData = updateStatusBarWithSummaryData;
function showStatus(msg, tooltip) {
    if (!tooltip) {
        tooltip = "Active code time today. Click to see more from Code Time.";
    }
    let loggedInName = Util_1.getItem("name");
    let userInfo = "";
    if (loggedInName && loggedInName !== "") {
        userInfo = ` Connected as ${loggedInName}`;
    }
    if (!showStatusBarText) {
        // add the message to the tooltip
        tooltip = msg + " | " + tooltip;
    }
    if (!ctMetricStatusBarItem) {
        return;
    }
    ctMetricStatusBarItem.tooltip = `${tooltip}${userInfo}`;
    if (!showStatusBarText) {
        ctMetricStatusBarItem.text = "$(clock)";
    }
    else {
        ctMetricStatusBarItem.text = msg;
    }
}
//# sourceMappingURL=StatusBarManager.js.map