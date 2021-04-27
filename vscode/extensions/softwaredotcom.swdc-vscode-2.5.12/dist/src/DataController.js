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
exports.writeProjectCommitDashboard = exports.writeProjectCommitDashboardByRangeType = exports.writeProjectCommitDashboardByStartEnd = exports.writeDailyReportDashboard = exports.removeAllSlackIntegrations = exports.authenticationCompleteHandler = exports.getPreference = exports.setPreference = exports.initializePreferences = exports.getUser = exports.reconcileSlackIntegrations = void 0;
const vscode_1 = require("vscode");
const HttpClient_1 = require("./http/HttpClient");
const Util_1 = require("./Util");
const Constants_1 = require("./Constants");
const SessionSummaryData_1 = require("./storage/SessionSummaryData");
const TimeSummaryData_1 = require("./storage/TimeSummaryData");
const websockets_1 = require("./websockets");
const SummaryManager_1 = require("./managers/SummaryManager");
const userEventEmitter_1 = require("./events/userEventEmitter");
const TeamManager_1 = require("./managers/TeamManager");
const StatusBarManager_1 = require("./managers/StatusBarManager");
const { WebClient } = require("@slack/web-api");
const fileIt = require("file-it");
function reconcileSlackIntegrations(user) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let foundNewIntegration = false;
        const slackIntegrations = [];
        if (user && user.integrations) {
            const currentIntegrations = Util_1.getIntegrations();
            // find the slack auth
            for (const integration of user.integrations) {
                // {access_token, name, plugin_uuid, scopes, pluginId, authId, refresh_token, scopes}
                const isSlackIntegration = !!(integration.name.toLowerCase() === "slack" &&
                    integration.status.toLowerCase() === "active" &&
                    integration.access_token);
                if (isSlackIntegration) {
                    const currentIntegration = currentIntegrations.find((n) => n.authId === integration.authId);
                    if (!currentIntegration || !currentIntegration.team_domain) {
                        // get the workspace domain using the authId
                        const web = new WebClient(integration.access_token);
                        const usersIdentify = yield web.users.identity().catch((e) => {
                            console.log("Error fetching slack team info: ", e.message);
                            return null;
                        });
                        if (usersIdentify) {
                            // usersIdentity returns
                            // {team: {id, name, domain, image_102, image_132, ....}...}
                            // set the domain
                            integration["team_domain"] = (_a = usersIdentify.team) === null || _a === void 0 ? void 0 : _a.domain;
                            integration["team_name"] = (_b = usersIdentify.team) === null || _b === void 0 ? void 0 : _b.name;
                            integration["integration_id"] = (_c = usersIdentify.user) === null || _c === void 0 ? void 0 : _c.id;
                            foundNewIntegration = true;
                            slackIntegrations.push(integration);
                        }
                    }
                    else {
                        // add the existing one back
                        slackIntegrations.push(currentIntegration);
                    }
                }
            }
        }
        Util_1.syncSlackIntegrations(slackIntegrations);
        return foundNewIntegration;
    });
}
exports.reconcileSlackIntegrations = reconcileSlackIntegrations;
function getUser() {
    return __awaiter(this, void 0, void 0, function* () {
        let api = `/users/me`;
        let resp = yield HttpClient_1.softwareGet(api, Util_1.getItem("jwt"));
        if (HttpClient_1.isResponseOk(resp)) {
            if (resp && resp.data && resp.data.data) {
                const user = resp.data.data;
                if (user.registered === 1) {
                    // update jwt to what the jwt is for this spotify user
                    Util_1.setItem("name", user.email);
                    yield reconcileSlackIntegrations(user);
                }
                return user;
            }
        }
        return null;
    });
}
exports.getUser = getUser;
function initializePreferences() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let jwt = Util_1.getItem("jwt");
        // use a default if we're unable to get the user or preferences
        let sessionThresholdInSec = Constants_1.DEFAULT_SESSION_THRESHOLD_SECONDS;
        // enable Git by default
        let disableGitData = false;
        let flowMode = {};
        if (jwt) {
            let user = yield getUser();
            userEventEmitter_1.userEventEmitter.emit("user_object_updated", user);
            // obtain the session threshold in seconds "sessionThresholdInSec"
            sessionThresholdInSec = ((_a = user === null || user === void 0 ? void 0 : user.preferences) === null || _a === void 0 ? void 0 : _a.sessionThresholdInSec) || Constants_1.DEFAULT_SESSION_THRESHOLD_SECONDS;
            disableGitData = !!((_b = user === null || user === void 0 ? void 0 : user.preferences) === null || _b === void 0 ? void 0 : _b.disableGitData);
            flowMode = (_c = user === null || user === void 0 ? void 0 : user.preferences) === null || _c === void 0 ? void 0 : _c.flowMode;
        }
        // update values config
        setPreference("sessionThresholdInSec", sessionThresholdInSec);
        setPreference("disableGitData", disableGitData);
        setPreference("flowMode", flowMode);
    });
}
exports.initializePreferences = initializePreferences;
function setPreference(preference, value) {
    return Util_1.setItem(preference, value);
}
exports.setPreference = setPreference;
function getPreference(preference) {
    return Util_1.getItem(preference);
}
exports.getPreference = getPreference;
function authenticationCompleteHandler(user) {
    return __awaiter(this, void 0, void 0, function* () {
        let updatedUserInfo = false;
        // clear the auth callback state
        Util_1.setItem("switching_account", false);
        Util_1.setAuthCallbackState(null);
        if ((user === null || user === void 0 ? void 0 : user.registered) === 1) {
            const currName = Util_1.getItem("name");
            if (currName != user.email) {
                updatedUserInfo = true;
                // new user
                if (user.plugin_jwt) {
                    Util_1.setItem("jwt", user.plugin_jwt);
                }
                Util_1.setItem("name", user.email);
                const currentAuthType = Util_1.getItem("authType");
                if (!currentAuthType) {
                    Util_1.setItem("authType", "software");
                }
                // update the login status
                vscode_1.window.showInformationMessage(`Successfully logged on to Code Time`);
                StatusBarManager_1.updateFlowModeStatus();
                try {
                    websockets_1.initializeWebsockets();
                }
                catch (e) {
                    console.error("Failed to initialize codetime websockets", e);
                }
                // fetch any teams for this user
                yield TeamManager_1.getTeams();
                SessionSummaryData_1.clearSessionSummaryData();
                TimeSummaryData_1.clearTimeDataSummary();
                // fetch after logging on
                SummaryManager_1.SummaryManager.getInstance().updateSessionSummaryFromServer();
                initializePreferences();
            }
            Util_1.setItem("vscode_CtskipSlackConnect", false);
        }
        // update this users integrations
        yield reconcileSlackIntegrations(user);
        vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        return updatedUserInfo;
    });
}
exports.authenticationCompleteHandler = authenticationCompleteHandler;
function removeAllSlackIntegrations() {
    const currentIntegrations = Util_1.getIntegrations();
    const newIntegrations = currentIntegrations.filter((n) => n.name.toLowerCase() !== "slack");
    Util_1.syncSlackIntegrations(newIntegrations);
}
exports.removeAllSlackIntegrations = removeAllSlackIntegrations;
function writeDailyReportDashboard(type = "yesterday", projectIds = []) {
    return __awaiter(this, void 0, void 0, function* () {
        let dashboardContent = "";
        const file = Util_1.getDailyReportSummaryFile();
        fileIt.writeContentFileSync(file, dashboardContent);
    });
}
exports.writeDailyReportDashboard = writeDailyReportDashboard;
function writeProjectCommitDashboardByStartEnd(start, end, project_ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const api = `/v1/user_metrics/project_summary`;
        const result = yield HttpClient_1.softwarePost(api, { project_ids, start, end }, Util_1.getItem("jwt"));
        yield writeProjectCommitDashboard(result);
    });
}
exports.writeProjectCommitDashboardByStartEnd = writeProjectCommitDashboardByStartEnd;
function writeProjectCommitDashboardByRangeType(type = "lastWeek", project_ids) {
    return __awaiter(this, void 0, void 0, function* () {
        project_ids = project_ids.filter((n) => n);
        const api = `/v1/user_metrics/project_summary`;
        const result = yield HttpClient_1.softwarePost(api, { project_ids, time_range: type }, Util_1.getItem("jwt"));
        yield writeProjectCommitDashboard(result);
    });
}
exports.writeProjectCommitDashboardByRangeType = writeProjectCommitDashboardByRangeType;
function writeProjectCommitDashboard(apiResult) {
    return __awaiter(this, void 0, void 0, function* () {
        let dashboardContent = "";
        // [{projectId, name, identifier, commits, files_changed, insertions, deletions, hours,
        //   keystrokes, characters_added, characters_deleted, lines_added, lines_removed},...]
        if (HttpClient_1.isResponseOk(apiResult)) {
            dashboardContent = apiResult.data;
        }
        else {
            dashboardContent += "No data available\n";
        }
        const file = Util_1.getProjectCodeSummaryFile();
        fileIt.writeContentFileSync(file, dashboardContent);
    });
}
exports.writeProjectCommitDashboard = writeProjectCommitDashboard;
//# sourceMappingURL=DataController.js.map