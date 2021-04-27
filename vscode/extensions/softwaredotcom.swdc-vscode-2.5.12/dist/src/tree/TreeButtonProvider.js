"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showMeTheDataKpmItem = exports.configureSettingsKpmItem = exports.getSwitchAccountButtonItem = exports.getStatusBarButtonItem = exports.getFeedbackButton = exports.getLearnMoreButton = exports.getHideStatusBarMetricsButton = exports.getSignUpButton = exports.getWebViewDashboardButton = exports.getActionButton = exports.getAuthTypeIconAndLabel = exports.getCodeTimeDashboardButton = exports.getViewProjectSummaryButton = void 0;
const Constants_1 = require("../Constants");
const StatusBarManager_1 = require("../managers/StatusBarManager");
const models_1 = require("../model/models");
const Util_1 = require("../Util");
const contants_1 = require("../app/contants");
function getViewProjectSummaryButton() {
    const commitSummitLabel = `Project summary`;
    const item = this.getActionButton(commitSummitLabel, "", "codetime.generateProjectSummary", "folder.svg", "", "red");
    item.location = "ct_menu_tree";
    item.name = "ct_project_summary_btn";
    item.interactionIcon = "folder";
    return item;
}
exports.getViewProjectSummaryButton = getViewProjectSummaryButton;
function getCodeTimeDashboardButton() {
    const item = this.getActionButton(`Dashboard`, "View your latest coding metrics right here in your editor", "codetime.viewDashboard", "dashboard.svg", "TreeViewLaunchDashboard", "purple");
    item.location = "ct_menu_tree";
    item.name = "ct_dashboard_btn";
    item.interactionIcon = "guage";
    return item;
}
exports.getCodeTimeDashboardButton = getCodeTimeDashboardButton;
function getAuthTypeIconAndLabel() {
    const authType = Util_1.getItem("authType");
    const name = Util_1.getItem("name");
    let tooltip = name ? `Connected as ${name}` : "";
    if (authType === "google") {
        return {
            icon: "google.svg",
            label: name,
            tooltip,
        };
    }
    else if (authType === "github") {
        return {
            icon: "github.svg",
            label: name,
            tooltip,
        };
    }
    return {
        icon: "email.svg",
        label: name,
        tooltip,
    };
}
exports.getAuthTypeIconAndLabel = getAuthTypeIconAndLabel;
function getActionButton(label, tooltip, command, icon = null, eventDescription = "", color = null, description = "") {
    const item = new models_1.KpmItem();
    item.tooltip = tooltip !== null && tooltip !== void 0 ? tooltip : "";
    item.label = label;
    item.id = label;
    item.command = command;
    item.icon = icon;
    item.contextValue = "action_button";
    item.eventDescription = eventDescription;
    item.color = color;
    item.description = description;
    return item;
}
exports.getActionButton = getActionButton;
function getWebViewDashboardButton() {
    const name = Util_1.getItem("name");
    const loggedInMsg = name ? ` Connected as ${name}` : "";
    const item = getActionButton("More data at Software.com", `See rich data visualizations in the web app.${loggedInMsg}`, "codetime.softwareKpmDashboard", "paw.svg", "TreeViewLaunchWebDashboard", "blue");
    item.location = "ct_menu_tree";
    item.name = "ct_web_metrics_btn";
    item.interactionIcon = "paw";
    return item;
}
exports.getWebViewDashboardButton = getWebViewDashboardButton;
function getSignUpButton(signUpAuthName, iconColor) {
    const authType = Util_1.getItem("authType");
    const signupText = authType ? Constants_1.LOGIN_LABEL : Constants_1.SIGN_UP_LABEL;
    const nameText = authType ? "log_in" : "sign_up";
    let label = `${signupText} with ${signUpAuthName}`;
    let icon = "email.svg";
    let iconName = "email";
    let command = "codetime.codeTimeLogin";
    const lcType = signUpAuthName.toLowerCase();
    if (lcType === "google") {
        icon = "google.svg";
        command = "codetime.googleLogin";
        iconName = "google";
    }
    else if (lcType === "github") {
        icon = "github.svg";
        command = "codetime.githubLogin";
        iconName = "github";
    }
    else if (lcType === "existing") {
        label = `${Constants_1.LOGIN_LABEL} with existing account`;
        icon = "paw.svg";
        command = "codetime.codeTimeExisting";
        iconName = "paw";
    }
    const item = getActionButton(label, "", command, icon, "", iconColor);
    item.location = "ct_menu_tree";
    item.name = `ct_${nameText}_${lcType}_btn`;
    item.interactionIcon = iconName;
    return item;
}
exports.getSignUpButton = getSignUpButton;
function getHideStatusBarMetricsButton() {
    let toggleStatusBarTextLabel = contants_1.SHOW_CODE_TIME_STATUS_LABEL;
    if (StatusBarManager_1.isStatusBarTextVisible()) {
        toggleStatusBarTextLabel = contants_1.HIDE_CODE_TIME_STATUS_LABEL;
    }
    const item = getActionButton(toggleStatusBarTextLabel, "Toggle the Code Time status", "codetime.toggleStatusBar", "visible.svg");
    item.location = "ct_menu_tree";
    item.name = "ct_toggle_status_bar_metrics_btn";
    item.color = "blue";
    item.interactionIcon = "slash-eye";
    return item;
}
exports.getHideStatusBarMetricsButton = getHideStatusBarMetricsButton;
function getLearnMoreButton() {
    const learnMoreLabel = `Documentation`;
    const item = getActionButton(learnMoreLabel, "View the Code Time Readme to learn more", "codetime.displayReadme", "readme.svg", "", "yellow");
    item.location = "ct_menu_tree";
    item.name = "ct_learn_more_btn";
    item.interactionIcon = "document";
    return item;
}
exports.getLearnMoreButton = getLearnMoreButton;
function getFeedbackButton() {
    const feedbackButton = getActionButton("Submit an issue", "Send us an email at cody@software.com", "codetime.submitAnIssue", "message.svg", "", "green");
    feedbackButton.name = "ct_submit_feedback_btn";
    feedbackButton.location = "ct_menu_tree";
    feedbackButton.interactionIcon = "text-bubble";
    return feedbackButton;
}
exports.getFeedbackButton = getFeedbackButton;
function getStatusBarButtonItem() {
    const item = getActionButton("status bar metrics button", "Code Time", "codetime.displaySidebar");
    item.location = "ct_menu_tree";
    item.name = `ct_status_bar_metrics_btn`;
    return item;
}
exports.getStatusBarButtonItem = getStatusBarButtonItem;
function getSwitchAccountButtonItem() {
    const item = getActionButton("switch account button", "Code Time", "codetime.switchAccounts");
    item.location = "ct_status_bar";
    item.name = `ct_switch_accounts_btn`;
    return item;
}
exports.getSwitchAccountButtonItem = getSwitchAccountButtonItem;
function configureSettingsKpmItem() {
    const item = new models_1.KpmItem();
    item.name = "ct_configure_settings_btn";
    item.description = "End of day notification - configure settings";
    item.location = "ct_notification";
    item.label = "Settings";
    item.interactionType = models_1.UIInteractionType.Click;
    item.interactionIcon = null;
    item.color = null;
    return item;
}
exports.configureSettingsKpmItem = configureSettingsKpmItem;
function showMeTheDataKpmItem() {
    const item = new models_1.KpmItem();
    item.name = "ct_show_me_the_data_btn";
    item.description = "End of day notification - Show me the data";
    item.location = "ct_notification";
    item.label = "Show me the data";
    item.interactionType = models_1.UIInteractionType.Click;
    item.interactionIcon = null;
    item.color = null;
    return item;
}
exports.showMeTheDataKpmItem = showMeTheDataKpmItem;
//# sourceMappingURL=TreeButtonProvider.js.map