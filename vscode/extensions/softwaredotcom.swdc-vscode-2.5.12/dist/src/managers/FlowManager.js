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
exports.determineFlowModeFromApi = exports.isInFlowMode = exports.pauseFlow = exports.getConfiguredScreenMode = exports.enableFlow = exports.getConfigSettingsTooltip = exports.isFlowModEnabled = exports.enabledFlow = exports.enablingFlow = void 0;
const vscode_1 = require("vscode");
const DataController_1 = require("../DataController");
const HttpClient_1 = require("../http/HttpClient");
const Util_1 = require("../Util");
const HttpClient_2 = require("../http/HttpClient");
const SlackManager_1 = require("./SlackManager");
const ScreenManager_1 = require("./ScreenManager");
const StatusBarManager_1 = require("./StatusBarManager");
exports.enablingFlow = false;
exports.enabledFlow = false;
let initialized = false;
function isFlowModEnabled() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!initialized && Util_1.getItem("jwt")) {
            exports.enabledFlow = yield determineFlowModeFromApi();
            initialized = true;
        }
        return exports.enabledFlow;
    });
}
exports.isFlowModEnabled = isFlowModEnabled;
/**
 * Screen Mode: full screen
 * Pause Notifications: on
 * Slack Away Msg: It's CodeTime!
 */
function getConfigSettingsTooltip() {
    var _a, _b, _c, _d, _e, _f, _g;
    const preferences = [];
    const flowModeSettings = DataController_1.getPreference("flowMode");
    // move this to the backend
    preferences.push(`**Screen Mode**: *${(_c = (_b = (_a = flowModeSettings === null || flowModeSettings === void 0 ? void 0 : flowModeSettings.editor) === null || _a === void 0 ? void 0 : _a.vscode) === null || _b === void 0 ? void 0 : _b.screenMode) === null || _c === void 0 ? void 0 : _c.toLowerCase()}*`);
    const notificationState = ((_d = flowModeSettings === null || flowModeSettings === void 0 ? void 0 : flowModeSettings.slack) === null || _d === void 0 ? void 0 : _d.pauseSlackNotifications) ? "on" : "off";
    preferences.push(`**Pause Notifications**: *${notificationState}*`);
    const slackStatusText = (_f = (_e = flowModeSettings === null || flowModeSettings === void 0 ? void 0 : flowModeSettings.slack) === null || _e === void 0 ? void 0 : _e.slackStatusText) !== null && _f !== void 0 ? _f : "";
    preferences.push(`**Slack Away Msg**: *${slackStatusText}*`);
    const autoEnableFlowMode = ((_g = flowModeSettings === null || flowModeSettings === void 0 ? void 0 : flowModeSettings.editor) === null || _g === void 0 ? void 0 : _g.autoEnableFlowMode) ? "on" : "off";
    preferences.push(`**Automatically Enable Flow Mode**: *${autoEnableFlowMode}*`);
    // 2 spaces followed by a newline will create newlines in markdown
    return preferences.length ? preferences.join("  \n") : "";
}
exports.getConfigSettingsTooltip = getConfigSettingsTooltip;
function enableFlow({ automated = false, skipSlackCheck = false }) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Enabling flow...",
            cancellable: false,
        }, (progress) => {
            return new Promise((resolve, reject) => {
                initiateFlow({ automated, skipSlackCheck }).catch((e) => { });
                resolve(true);
            });
        });
    });
}
exports.enableFlow = enableFlow;
function getConfiguredScreenMode() {
    var _a, _b;
    const flowModeSettings = DataController_1.getPreference("flowMode");
    const screenMode = (_b = (_a = flowModeSettings === null || flowModeSettings === void 0 ? void 0 : flowModeSettings.editor) === null || _a === void 0 ? void 0 : _a.vscode) === null || _b === void 0 ? void 0 : _b.screenMode;
    if (screenMode === null || screenMode === void 0 ? void 0 : screenMode.includes("Full Screen")) {
        return ScreenManager_1.FULL_SCREEN_MODE_ID;
    }
    else if (screenMode === null || screenMode === void 0 ? void 0 : screenMode.includes("Zen")) {
        return ScreenManager_1.ZEN_MODE_ID;
    }
    return ScreenManager_1.NORMAL_SCREEN_MODE;
}
exports.getConfiguredScreenMode = getConfiguredScreenMode;
function initiateFlow({ automated = false, skipSlackCheck = false }) {
    return __awaiter(this, void 0, void 0, function* () {
        const isRegistered = SlackManager_1.checkRegistration(false);
        if (!isRegistered) {
            // show the flow mode prompt
            SlackManager_1.showModalSignupPrompt("To use Flow Mode, please first sign up or login.");
            return;
        }
        // { connected, usingAllSettingsForFlow }
        if (!skipSlackCheck) {
            const connectInfo = yield SlackManager_1.checkSlackConnectionForFlowMode();
            if (!connectInfo.continue) {
                return;
            }
        }
        const preferredScreenMode = getConfiguredScreenMode();
        // create a FlowSession on backend.  Also handles 3rd party automations (slack, cal, etc)
        HttpClient_1.softwarePost("/v1/flow_sessions", { automated }, Util_1.getItem("jwt"));
        // update screen mode
        if (preferredScreenMode === ScreenManager_1.FULL_SCREEN_MODE_ID) {
            ScreenManager_1.showFullScreenMode();
        }
        else if (preferredScreenMode === ScreenManager_1.ZEN_MODE_ID) {
            ScreenManager_1.showZenMode();
        }
        else {
            ScreenManager_1.showNormalScreenMode();
        }
        exports.enabledFlow = true;
        exports.enablingFlow = false;
        vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        StatusBarManager_1.updateFlowModeStatus();
    });
}
function pauseFlow() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.enabledFlow) {
            vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Notification,
                title: "Turning off flow...",
                cancellable: false,
            }, (progress) => {
                return new Promise((resolve, reject) => {
                    pauseFlowInitiate().catch((e) => { });
                    resolve(true);
                });
            });
        }
    });
}
exports.pauseFlow = pauseFlow;
function pauseFlowInitiate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield HttpClient_1.softwareDelete("/v1/flow_sessions", Util_1.getItem("jwt"));
        ScreenManager_1.showNormalScreenMode();
        exports.enabledFlow = false;
        vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        StatusBarManager_1.updateFlowModeStatus();
    });
}
function isInFlowMode() {
    return __awaiter(this, void 0, void 0, function* () {
        if (exports.enablingFlow) {
            return true;
        }
        else if (!exports.enabledFlow) {
            return false;
        }
        // we've made it here, check the api and screen state
        return yield determineFlowModeFromApi();
    });
}
exports.isInFlowMode = isInFlowMode;
function determineFlowModeFromApi() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const flowSessionsReponse = Util_1.getItem("jwt") ? yield HttpClient_2.softwareGet("/v1/flow_sessions", Util_1.getItem("jwt")) : { data: { flow_sessions: [] } };
        const openFlowSessions = (_a = flowSessionsReponse === null || flowSessionsReponse === void 0 ? void 0 : flowSessionsReponse.data) === null || _a === void 0 ? void 0 : _a.flow_sessions;
        // make sure "enabledFlow" is set as it's used as a getter outside this export
        exports.enabledFlow = (openFlowSessions === null || openFlowSessions === void 0 ? void 0 : openFlowSessions.length) > 0;
        return exports.enabledFlow;
    });
}
exports.determineFlowModeFromApi = determineFlowModeFromApi;
//# sourceMappingURL=FlowManager.js.map