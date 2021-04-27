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
exports.getDecodedUserIdFromJwt = exports.createAnonymousUser = exports.showSignUpAccountMenu = exports.showExistingAccountMenu = exports.showSwitchAccountsMenu = void 0;
const Util_1 = require("../Util");
const HttpClient_1 = require("../http/HttpClient");
const MenuManager_1 = require("./MenuManager");
const Constants_1 = require("../Constants");
const jwt_decode = require("jwt-decode");
let switching_account = false;
const switchAccountItem = {
    label: "Switch to a different account?",
    detail: "Click to link to a different account.",
};
function showSwitchAccountsMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        switching_account = true;
        accountMenuSelection(switchAccountItem);
    });
}
exports.showSwitchAccountsMenu = showSwitchAccountsMenu;
function showExistingAccountMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        switching_account = true;
        showLogInMenuOptions();
    });
}
exports.showExistingAccountMenu = showExistingAccountMenu;
function showSignUpAccountMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        switching_account = false;
        showSignUpMenuOptions();
    });
}
exports.showSignUpAccountMenu = showSignUpAccountMenu;
function accountMenuSelection(placeholderItem) {
    return __awaiter(this, void 0, void 0, function* () {
        const items = [];
        let placeholder = "";
        const name = Util_1.getItem("name");
        if (name) {
            const authType = Util_1.getItem("authType");
            let type = "email";
            if (authType === "google") {
                type = "Google";
            }
            else if (authType === "github") {
                type = "GitHub";
            }
            placeholder = `Connected using ${type} (${name})`;
        }
        else {
            placeholder = "Connect using one of the following";
        }
        if (placeholderItem) {
            items.push(placeholderItem);
        }
        const menuOptions = {
            items,
            placeholder,
        };
        const selection = yield MenuManager_1.showQuickPick(menuOptions);
        if (selection) {
            // show the google, github, email menu options
            showLogInMenuOptions();
        }
    });
}
function showLogInMenuOptions() {
    showAuthMenuOptions(Constants_1.LOGIN_LABEL, false /*isSignup*/);
}
function showSignUpMenuOptions() {
    showAuthMenuOptions(Constants_1.SIGN_UP_LABEL, true /*isSignup*/);
}
function showAuthMenuOptions(authText, isSignup = true) {
    const items = [];
    const placeholder = `${authText} using...`;
    items.push({
        label: `${authText} with Google`,
        command: "codetime.googleLogin",
        commandArgs: [null /*KpmItem*/, switching_account],
    });
    items.push({
        label: `${authText} with GitHub`,
        command: "codetime.githubLogin",
        commandArgs: [null /*KpmItem*/, switching_account],
    });
    if (isSignup) {
        items.push({
            label: `${authText} with Email`,
            command: "codetime.codeTimeSignup",
            commandArgs: [null /*KpmItem*/, false /*switching_account*/],
        });
    }
    else {
        items.push({
            label: `${authText} with Email`,
            command: "codetime.codeTimeLogin",
            commandArgs: [null /*KpmItem*/, switching_account],
        });
    }
    const menuOptions = {
        items,
        placeholder,
    };
    MenuManager_1.showQuickPick(menuOptions);
}
/**
 * create an anonymous user based on github email or mac addr
 */
function createAnonymousUser(ignoreJwt = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const jwt = Util_1.getItem("jwt");
        // check one more time before creating the anon user
        if (!jwt || ignoreJwt) {
            // this should not be undefined if its an account reset
            let plugin_uuid = Util_1.getPluginUuid();
            let auth_callback_state = Util_1.getAuthCallbackState();
            const username = yield Util_1.getOsUsername();
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const hostname = yield Util_1.getHostname();
            const resp = yield HttpClient_1.softwarePost("/plugins/onboard", {
                timezone,
                username,
                plugin_uuid,
                hostname,
                auth_callback_state,
            });
            if (HttpClient_1.isResponseOk(resp) && resp.data && resp.data.jwt) {
                Util_1.setItem("jwt", resp.data.jwt);
                if (!resp.data.user.registered) {
                    Util_1.setItem("name", null);
                }
                Util_1.setItem("switching_account", false);
                Util_1.setAuthCallbackState(null);
                return resp.data.jwt;
            }
        }
        return null;
    });
}
exports.createAnonymousUser = createAnonymousUser;
function getDecodedUserIdFromJwt(jwt) {
    try {
        if (jwt && jwt.includes("JWT")) {
            return jwt_decode(jwt.split("JWT")[1])["id"];
        }
    }
    catch (e) { }
    return -1;
}
exports.getDecodedUserIdFromJwt = getDecodedUserIdFromJwt;
//# sourceMappingURL=AccountManager.js.map