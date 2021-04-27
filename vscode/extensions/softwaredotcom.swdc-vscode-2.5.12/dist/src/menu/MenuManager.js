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
exports.launchWebDashboardView = exports.showMenuOptions = exports.showQuickPick = void 0;
const vscode_1 = require("vscode");
const Util_1 = require("../Util");
const Constants_1 = require("../Constants");
const WebViewManager_1 = require("../managers/WebViewManager");
const StatusBarManager_1 = require("../managers/StatusBarManager");
const OnboardManager_1 = require("../user/OnboardManager");
const contants_1 = require("../app/contants");
/**
 * Pass in the following array of objects
 * options: {placeholder, items: [{label, description, url, detail, tooltip},...]}
 */
function showQuickPick(pickOptions) {
    if (!pickOptions || !pickOptions["items"]) {
        return;
    }
    let options = {
        matchOnDescription: false,
        matchOnDetail: false,
        placeHolder: pickOptions.placeholder || "",
    };
    return vscode_1.window.showQuickPick(pickOptions.items, options).then((item) => __awaiter(this, void 0, void 0, function* () {
        if (item) {
            const url = item["url"];
            const cb = item["cb"];
            const command = item["command"];
            const commandArgs = item["commandArgs"] || [];
            if (url) {
                Util_1.launchWebUrl(url);
            }
            else if (cb) {
                cb();
            }
            else if (command) {
                vscode_1.commands.executeCommand(command, ...commandArgs);
            }
        }
        return item;
    }));
}
exports.showQuickPick = showQuickPick;
function showMenuOptions() {
    return __awaiter(this, void 0, void 0, function* () {
        const email = Util_1.getItem("name");
        // {placeholder, items: [{label, description, url, details, tooltip},...]}
        let kpmMenuOptions = {
            items: [],
        };
        kpmMenuOptions.items.push({
            label: "Generate dashboard",
            detail: "View your latest coding metrics right here in your editor",
            url: null,
            cb: WebViewManager_1.showDashboard,
            eventDescription: "PaletteMenuLaunchDashboard",
        });
        let loginMsgDetail = "Finish creating your account and see rich data visualizations.";
        if (!email) {
            kpmMenuOptions.items.push({
                label: Constants_1.LOGIN_LABEL,
                detail: loginMsgDetail,
                url: null,
                cb: OnboardManager_1.launchLogin,
                eventDescription: "PaletteMenuLogin",
            });
        }
        let toggleStatusBarTextLabel = contants_1.SHOW_CODE_TIME_STATUS_LABEL;
        if (StatusBarManager_1.isStatusBarTextVisible()) {
            toggleStatusBarTextLabel = contants_1.HIDE_CODE_TIME_STATUS_LABEL;
        }
        kpmMenuOptions.items.push({
            label: toggleStatusBarTextLabel,
            detail: "Toggle the Code Time status",
            url: null,
            cb: null,
            command: "codetime.toggleStatusBar",
        });
        kpmMenuOptions.items.push({
            label: "Submit an issue on GitHub",
            detail: "Encounter a bug? Submit an issue on our GitHub page",
            url: "https://github.com/swdotcom/swdc-vscode/issues",
            cb: null,
        });
        kpmMenuOptions.items.push({
            label: "Submit feedback",
            detail: "Send us an email at cody@software.com",
            cb: null,
            command: "codetime.sendFeedback",
        });
        if (email) {
            kpmMenuOptions.items.push({
                label: "Web dashboard",
                detail: "See rich data visualizations in the web app",
                url: null,
                cb: launchWebDashboardView,
                eventDescription: "PaletteMenuLaunchWebDashboard",
            });
        }
        showQuickPick(kpmMenuOptions);
    });
}
exports.showMenuOptions = showMenuOptions;
function launchWebDashboardView() {
    return __awaiter(this, void 0, void 0, function* () {
        Util_1.launchWebUrl(`${Constants_1.launch_url}/login`);
    });
}
exports.launchWebDashboardView = launchWebDashboardView;
//# sourceMappingURL=MenuManager.js.map