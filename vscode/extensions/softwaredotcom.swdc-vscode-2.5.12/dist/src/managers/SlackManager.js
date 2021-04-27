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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSlackConnectionForFlowMode = exports.checkSlackConnection = exports.showModalSignupPrompt = exports.checkRegistration = exports.disconnectSlackAuth = exports.disconnectSlackWorkspace = exports.disconectAllSlackIntegrations = exports.connectSlackWorkspace = exports.getSlackAccessToken = exports.hasSlackWorkspaces = exports.getSlackWorkspaces = void 0;
const vscode_1 = require("vscode");
const Constants_1 = require("../Constants");
const Util_1 = require("../Util");
const MenuManager_1 = require("../menu/MenuManager");
const HttpClient_1 = require("../http/HttpClient");
const queryString = require("query-string");
// -------------------------------------------
// - public methods
// -------------------------------------------
// get saved slack integrations
function getSlackWorkspaces() {
    return Util_1.getIntegrations().filter((n) => n.name.toLowerCase() === "slack" && n.status.toLowerCase() === "active");
}
exports.getSlackWorkspaces = getSlackWorkspaces;
function hasSlackWorkspaces() {
    return !!getSlackWorkspaces().length;
}
exports.hasSlackWorkspaces = hasSlackWorkspaces;
// get the access token of a selected slack workspace
function getSlackAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const selectedTeamDomain = yield showSlackWorkspaceSelection();
        if (selectedTeamDomain) {
            return getWorkspaceAccessToken(selectedTeamDomain);
        }
        return null;
    });
}
exports.getSlackAccessToken = getSlackAccessToken;
// connect slack flow
function connectSlackWorkspace() {
    return __awaiter(this, void 0, void 0, function* () {
        const registered = yield checkRegistration();
        if (!registered) {
            return;
        }
        const qryStr = queryString.stringify({
            plugin: Util_1.getPluginType(),
            plugin_uuid: Util_1.getPluginUuid(),
            pluginVersion: Util_1.getVersion(),
            plugin_id: Util_1.getPluginId(),
            auth_callback_state: Util_1.getAuthCallbackState(),
            integrate: "slack",
            upgrade_features: "flow",
            plugin_token: Util_1.getItem("jwt"),
        });
        const url = `${Constants_1.api_endpoint}/auth/slack?${qryStr}`;
        // authorize the user for slack
        Util_1.launchWebUrl(url);
    });
}
exports.connectSlackWorkspace = connectSlackWorkspace;
function disconectAllSlackIntegrations(showPrompt = true) {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const workspaces = getSlackWorkspaces();
        if (workspaces === null || workspaces === void 0 ? void 0 : workspaces.length) {
            try {
                for (var workspaces_1 = __asyncValues(workspaces), workspaces_1_1; workspaces_1_1 = yield workspaces_1.next(), !workspaces_1_1.done;) {
                    const workspace = workspaces_1_1.value;
                    yield disconnectSlackAuth(workspace.authId, showPrompt);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (workspaces_1_1 && !workspaces_1_1.done && (_a = workspaces_1.return)) yield _a.call(workspaces_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    });
}
exports.disconectAllSlackIntegrations = disconectAllSlackIntegrations;
function disconnectSlackWorkspace() {
    return __awaiter(this, void 0, void 0, function* () {
        const registered = yield checkRegistration();
        if (!registered) {
            return;
        }
        // pick the workspace to disconnect
        const selectedTeamDomain = yield showSlackWorkspaceSelection();
        if (selectedTeamDomain) {
            disconnectSlackAuth(selectedTeamDomain.authId);
        }
    });
}
exports.disconnectSlackWorkspace = disconnectSlackWorkspace;
// disconnect slack flow
function disconnectSlackAuth(authId, showPrompt = true) {
    return __awaiter(this, void 0, void 0, function* () {
        // get the domain
        const integration = getSlackWorkspaces().find((n) => n.authId === authId);
        if (!integration) {
            vscode_1.window.showErrorMessage("Unable to find selected integration to disconnect");
            vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
            return;
        }
        // ask before disconnecting
        let selection = Constants_1.DISCONNECT_LABEL;
        if (showPrompt) {
            selection = yield vscode_1.window.showInformationMessage(`Are you sure you would like to disconnect the '${integration.team_domain}' Slack workspace?`, ...[Constants_1.DISCONNECT_LABEL]);
        }
        if (selection === Constants_1.DISCONNECT_LABEL) {
            // await softwarePut(`/auth/slack/disconnect`, { authId }, getItem("jwt"));
            yield HttpClient_1.softwareDelete(`/integrations/${integration.id}`, Util_1.getItem("jwt"));
            // disconnected, remove it from the integrations
            removeSlackIntegration(authId);
            vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        }
    });
}
exports.disconnectSlackAuth = disconnectSlackAuth;
// -------------------------------------------
// - private methods
// -------------------------------------------
function showSlackWorkspaceSelection() {
    return __awaiter(this, void 0, void 0, function* () {
        let menuOptions = {
            items: [],
            placeholder: `Select a Slack workspace`,
        };
        const integrations = getSlackWorkspaces();
        integrations.forEach((integration) => {
            menuOptions.items.push({
                label: integration.team_domain,
                value: integration.team_domain,
            });
        });
        menuOptions.items.push({
            label: "Connect a Slack workspace",
            command: "musictime.connectSlack",
        });
        const pick = yield MenuManager_1.showQuickPick(menuOptions);
        if (pick) {
            if (pick.value) {
                return pick.value;
            }
            else if (pick.command) {
                vscode_1.commands.executeCommand(pick.command);
                return null;
            }
        }
        return null;
    });
}
function getWorkspaceAccessToken(team_domain) {
    const integration = getSlackWorkspaces().find((n) => n.team_domain === team_domain);
    if (integration) {
        return integration.access_token;
    }
    return null;
}
/**
 * Remove an integration from the local copy
 * @param authId
 */
function removeSlackIntegration(authId) {
    const currentIntegrations = Util_1.getIntegrations();
    const newIntegrations = currentIntegrations.filter((n) => n.authId !== authId);
    Util_1.syncSlackIntegrations(newIntegrations);
}
function checkRegistration(showSignup = true) {
    if (!Util_1.getItem("name")) {
        if (showSignup) {
            showModalSignupPrompt("Connecting Slack requires a registered account. Sign up or log in to continue.");
        }
        return false;
    }
    return true;
}
exports.checkRegistration = checkRegistration;
function showModalSignupPrompt(msg) {
    vscode_1.window
        .showInformationMessage(msg, {
        modal: true,
    }, Constants_1.SIGN_UP_LABEL)
        .then((selection) => __awaiter(this, void 0, void 0, function* () {
        if (selection === Constants_1.SIGN_UP_LABEL) {
            vscode_1.commands.executeCommand("codetime.signUpAccount");
        }
    }));
}
exports.showModalSignupPrompt = showModalSignupPrompt;
function checkSlackConnection(showConnect = true) {
    if (!hasSlackWorkspaces()) {
        if (showConnect) {
            vscode_1.window
                .showInformationMessage("Connect a Slack workspace to continue.", {
                modal: true,
            }, "Connect")
                .then((selection) => __awaiter(this, void 0, void 0, function* () {
                if (selection === "Connect") {
                    vscode_1.commands.executeCommand("codetime.connectSlackWorkspace");
                }
            }));
        }
        return false;
    }
    return true;
}
exports.checkSlackConnection = checkSlackConnection;
function checkSlackConnectionForFlowMode() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!hasSlackWorkspaces()) {
            const selection = yield vscode_1.window.showInformationMessage("Slack isn't connected", { modal: true }, ...["Continue anyway", "Connect Slack"]);
            if (!selection) {
                // the user selected "cancel"
                return { continue: false, useSlackSettings: true };
            }
            else if (selection === "Continue anyway") {
                // slack is not connected, but continue. set useSlackSettings to FALSE
                // set continue to TRUE
                return { continue: true, useSlackSettings: false };
            }
            else {
                // connect was selected
                vscode_1.commands.executeCommand("codetime.connectSlackWorkspace");
                return { continue: false, useSlackSettings: true };
            }
        }
        return { continue: true, useSlackSettings: true };
    });
}
exports.checkSlackConnectionForFlowMode = checkSlackConnectionForFlowMode;
//# sourceMappingURL=SlackManager.js.map