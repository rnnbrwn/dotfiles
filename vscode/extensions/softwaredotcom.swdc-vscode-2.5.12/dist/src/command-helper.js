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
exports.createCommands = void 0;
const vscode_1 = require("vscode");
const Util_1 = require("./Util");
const models_1 = require("./model/models");
const ProjectCommitManager_1 = require("./menu/ProjectCommitManager");
const AccountManager_1 = require("./menu/AccountManager");
const TrackerManager_1 = require("./managers/TrackerManager");
const SlackManager_1 = require("./managers/SlackManager");
const Constants_1 = require("./Constants");
const OsaScriptManager_1 = require("./managers/OsaScriptManager");
const ContextMenuManager_1 = require("./menu/ContextMenuManager");
const FlowManager_1 = require("./managers/FlowManager");
const ScreenManager_1 = require("./managers/ScreenManager");
const WebViewManager_1 = require("./managers/WebViewManager");
const ConfigManager_1 = require("./managers/ConfigManager");
const TreeButtonProvider_1 = require("./tree/TreeButtonProvider");
const CodeTimeWebviewSidebar_1 = require("./sidebar/CodeTimeWebviewSidebar");
const TeamManager_1 = require("./managers/TeamManager");
const StatusBarManager_1 = require("./managers/StatusBarManager");
const OnboardManager_1 = require("./user/OnboardManager");
function createCommands(ctx, kpmController) {
    let cmds = [];
    const tracker = TrackerManager_1.TrackerManager.getInstance();
    cmds.push(kpmController);
    // WEB VIEW PROVIDER
    const ctWebviewSidebar = new CodeTimeWebviewSidebar_1.CodeTimeWebviewSidebar(ctx.extensionUri);
    cmds.push(vscode_1.window.registerWebviewViewProvider("codetime.webView", ctWebviewSidebar, {
        webviewOptions: {
            retainContextWhenHidden: true,
        },
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.refreshCodeTimeView", () => {
        ctWebviewSidebar.refresh();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.displaySidebar", () => {
        // logic to open the sidebar (need to figure out how to reveal the sidebar webview)
        vscode_1.commands.executeCommand("workbench.view.extension.code-time-sidebar");
        tracker.trackUIInteraction(TreeButtonProvider_1.getStatusBarButtonItem());
    }));
    // SWITCH ACCOUNT BUTTON
    cmds.push(vscode_1.commands.registerCommand("codetime.switchAccounts", (item) => {
        tracker.trackUIInteraction(TreeButtonProvider_1.getSwitchAccountButtonItem());
        AccountManager_1.showSwitchAccountsMenu();
    }));
    // PROCESS KEYSTROKES NOW
    cmds.push(vscode_1.commands.registerCommand("codetime.processKeystrokeData", () => {
        kpmController.processKeystrokeData(true /*isUnfocus*/);
    }));
    // SHOW WEB ANALYTICS
    cmds.push(vscode_1.commands.registerCommand("codetime.softwareKpmDashboard", (item) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getWebViewDashboardButton();
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.name = "ct_web_metrics_cmd";
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        Util_1.launchWebDashboard();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.createTeam", () => {
        Util_1.launchWebUrl(Constants_1.organizations_url);
    }));
    // OPEN SPECIFIED FILE IN EDITOR
    cmds.push(vscode_1.commands.registerCommand("codetime.openFileInEditor", (file) => {
        Util_1.openFileInEditor(file);
    }));
    // TOGGLE STATUS BAR METRIC VISIBILITY
    cmds.push(vscode_1.commands.registerCommand("codetime.toggleStatusBar", (item) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getHideStatusBarMetricsButton();
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.name = "ct_toggle_status_bar_metrics_cmd";
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        StatusBarManager_1.toggleStatusBar();
    }));
    // LAUNCH EMAIL LOGIN
    cmds.push(vscode_1.commands.registerCommand("codetime.codeTimeLogin", (item, switching_account) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getSignUpButton("email", "grey");
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        OnboardManager_1.launchLogin("software", switching_account);
    }));
    // LAUNCH EMAIL LOGIN
    cmds.push(vscode_1.commands.registerCommand("codetime.codeTimeSignup", (item, switching_account) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getSignUpButton("email", "grey");
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        OnboardManager_1.launchEmailSignup(switching_account);
    }));
    // LAUNCH EXISTING ACCOUNT LOGIN
    cmds.push(vscode_1.commands.registerCommand("codetime.codeTimeExisting", (item, switching_account) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getSignUpButton("existing", "blue");
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        // launch the auth selection flow
        AccountManager_1.showExistingAccountMenu();
    }));
    // LAUNCH SIGN UP FLOW
    cmds.push(vscode_1.commands.registerCommand("codetime.signUpAccount", (item, switching_account) => {
        // launch the auth selection flow
        AccountManager_1.showSignUpAccountMenu();
    }));
    // LAUNCH GOOGLE LOGIN
    cmds.push(vscode_1.commands.registerCommand("codetime.googleLogin", (item, switching_account) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getSignUpButton("Google", null);
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.interactionIcon = null;
            item.color = null;
        }
        item.interactionIcon = "google";
        tracker.trackUIInteraction(item);
        OnboardManager_1.launchLogin("google", switching_account);
    }));
    // LAUNCH GITHUB LOGIN
    cmds.push(vscode_1.commands.registerCommand("codetime.githubLogin", (item, switching_account) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getSignUpButton("GitHub", "white");
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        OnboardManager_1.launchLogin("github", switching_account);
    }));
    // SUBMIT AN ISSUE
    cmds.push(vscode_1.commands.registerCommand("codetime.submitAnIssue", (item) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getFeedbackButton();
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
        }
        tracker.trackUIInteraction(item);
        Util_1.launchWebUrl(Constants_1.vscode_issues_url);
    }));
    // DISPLAY README MD
    cmds.push(vscode_1.commands.registerCommand("codetime.displayReadme", (item) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getLearnMoreButton();
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.name = "ct_learn_more_cmd";
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        Util_1.displayReadmeIfNotExists(true /*override*/);
    }));
    // DISPLAY PROJECT METRICS REPORT
    cmds.push(vscode_1.commands.registerCommand("codetime.generateProjectSummary", (item) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getViewProjectSummaryButton();
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.name = "ct_project_summary_cmd";
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        ProjectCommitManager_1.ProjectCommitManager.getInstance().launchViewProjectSummaryMenuFlow();
    }));
    // DISPLAY CODETIME DASHBOARD WEBVIEW
    cmds.push(vscode_1.commands.registerCommand("codetime.viewDashboard", (item) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getCodeTimeDashboardButton();
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
            item.name = "ct_dashboard_cmd";
            item.interactionIcon = null;
            item.color = null;
        }
        tracker.trackUIInteraction(item);
        WebViewManager_1.showDashboard();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.viewSoftwareTop40", () => {
        Util_1.launchWebUrl("https://api.software.com/music/top40");
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.sendFeedback", (item) => {
        if (!item) {
            // it's from the command palette, create a kpm item so
            // it can build the ui_element in the tracker manager
            item = TreeButtonProvider_1.getFeedbackButton();
            item.location = "ct_command_palette";
            item.interactionType = models_1.UIInteractionType.Keyboard;
        }
        tracker.trackUIInteraction(item);
        Util_1.launchWebUrl("mailto:cody@software.com");
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.connectSlackWorkspace", () => {
        SlackManager_1.connectSlackWorkspace();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.disconnectSlackWorkspace", (authId) => {
        if (authId) {
            SlackManager_1.disconnectSlackAuth(authId);
        }
        else {
            SlackManager_1.disconnectSlackWorkspace();
        }
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.showZenMode", () => {
        ScreenManager_1.showZenMode();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.showFullScreen", () => {
        ScreenManager_1.showFullScreenMode();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.exitFullScreen", () => {
        ScreenManager_1.showNormalScreenMode();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.toggleDarkMode", () => {
        OsaScriptManager_1.toggleDarkMode();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.toggleDocPosition", () => {
        OsaScriptManager_1.toggleDock();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.switchAverageComparison", () => {
        // launch the options command palette
        ContextMenuManager_1.switchAverageComparison();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.enableFlow", (options) => {
        const skipSlackCheck = !!((options === null || options === void 0 ? void 0 : options.skipSlackCheck) === true);
        FlowManager_1.enableFlow({ automated: false, skipSlackCheck });
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.exitFlowMode", () => {
        FlowManager_1.pauseFlow();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.configureSettings", () => {
        ConfigManager_1.configureSettings();
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.showTeamDashboard", (teamId) => {
        Util_1.launchWebUrl(`${Constants_1.launch_url}/team-dashboard/${teamId}`);
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.skipSlackConnect", () => {
        Util_1.setItem("vscode_CtskipSlackConnect", true);
        // refresh the view
        vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
    }));
    cmds.push(vscode_1.commands.registerCommand("codetime.reloadTeams", () => __awaiter(this, void 0, void 0, function* () {
        yield TeamManager_1.getTeams();
        vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
    })));
    return vscode_1.Disposable.from(...cmds);
}
exports.createCommands = createCommands;
//# sourceMappingURL=command-helper.js.map