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
exports.buildEmailSignup = exports.buildLoginUrl = exports.launchLogin = exports.launchEmailSignup = exports.handleIncompleteAuth = exports.lazilyPollForAuth = exports.onboardInit = exports.updatedAuthAdded = void 0;
const vscode_1 = require("vscode");
const Util_1 = require("../Util");
const HttpClient_1 = require("../http/HttpClient");
const AccountManager_1 = require("../menu/AccountManager");
const DataController_1 = require("../DataController");
const Constants_1 = require("../Constants");
const queryString = require("query-string");
let retry_counter = 0;
let authAdded = false;
const one_min_millis = 1000 * 60;
function updatedAuthAdded(val) {
    authAdded = val;
}
exports.updatedAuthAdded = updatedAuthAdded;
function onboardInit(ctx, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        let jwt = Util_1.getItem("jwt");
        const windowState = vscode_1.window.state;
        if (jwt) {
            yield handleIncompleteAuth();
            // we have the jwt, call the callback that anon was not created
            return callback(ctx, false /*anonCreated*/);
        }
        if (windowState.focused) {
            // perform primary window related work
            primaryWindowOnboarding(ctx, callback);
        }
        else {
            // call the secondary onboarding logic
            secondaryWindowOnboarding(ctx, callback);
        }
    });
}
exports.onboardInit = onboardInit;
function primaryWindowOnboarding(ctx, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        let serverIsOnline = yield HttpClient_1.serverIsAvailable();
        if (serverIsOnline) {
            // great, it's online, create the anon user
            const jwt = yield AccountManager_1.createAnonymousUser();
            if (jwt) {
                // great, it worked. call the callback
                return callback(ctx, true /*anonCreated*/);
            }
            // else its some kind of server issue, try again in a minute
            serverIsOnline = false;
        }
        if (!serverIsOnline) {
            // not online, try again in a minute
            if (retry_counter === 0) {
                // show the prompt that we're unable connect to our app 1 time only
                Util_1.showOfflinePrompt(true);
            }
            // call activate again later
            setTimeout(() => {
                retry_counter++;
                onboardInit(ctx, callback);
            }, one_min_millis * 2);
        }
    });
}
/**
 * This is called if there's no JWT. If it reaches a
 * 6th call it will create an anon user.
 * @param ctx
 * @param callback
 */
function secondaryWindowOnboarding(ctx, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const serverIsOnline = yield HttpClient_1.serverIsAvailable();
        if (!serverIsOnline) {
            // not online, try again later
            setTimeout(() => {
                onboardInit(ctx, callback);
            }, one_min_millis);
            return;
        }
        else if (retry_counter < 5) {
            if (serverIsOnline) {
                retry_counter++;
            }
            // call activate again in about 15 seconds
            setTimeout(() => {
                onboardInit(ctx, callback);
            }, 1000 * 15);
            return;
        }
        // tried enough times, create an anon user
        yield AccountManager_1.createAnonymousUser();
        // call the callback
        return callback(ctx, true /*anonCreated*/);
    });
}
function lazilyPollForAuth(tries = 20) {
    return __awaiter(this, void 0, void 0, function* () {
        authAdded = !authAdded ? yield getUserRegistrationInfo() : authAdded;
        if (!authAdded && tries > 0) {
            // try again
            tries--;
            setTimeout(() => {
                lazilyPollForAuth(tries);
            }, 15000);
        }
    });
}
exports.lazilyPollForAuth = lazilyPollForAuth;
function handleIncompleteAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = Util_1.getItem("name");
        if (!name) {
            // fetch the user
            getUserRegistrationInfo();
        }
    });
}
exports.handleIncompleteAuth = handleIncompleteAuth;
function getUserRegistrationInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        const token = Util_1.getAuthCallbackState(false) || Util_1.getItem("jwt");
        // fetch the user
        let resp = yield HttpClient_1.softwareGet("/users/plugin/state", token);
        let user = HttpClient_1.isResponseOk(resp) && resp.data ? resp.data.user : null;
        if (user) {
            yield DataController_1.authenticationCompleteHandler(user);
            return true;
        }
        return false;
    });
}
function launchEmailSignup(switching_account = false) {
    return __awaiter(this, void 0, void 0, function* () {
        Util_1.setItem("authType", "software");
        Util_1.setItem("switching_account", switching_account);
        // continue with onboaring
        const url = yield buildEmailSignup();
        Util_1.launchWebUrl(url);
    });
}
exports.launchEmailSignup = launchEmailSignup;
function launchLogin(loginType = "software", switching_account = false) {
    return __awaiter(this, void 0, void 0, function* () {
        Util_1.setItem("authType", loginType);
        Util_1.setItem("switching_account", switching_account);
        // continue with onboaring
        const url = yield buildLoginUrl(loginType);
        Util_1.launchWebUrl(url);
    });
}
exports.launchLogin = launchLogin;
/**
 * @param loginType "software" | "existing" | "google" | "github"
 */
function buildLoginUrl(loginType) {
    return __awaiter(this, void 0, void 0, function* () {
        const auth_callback_state = Util_1.getAuthCallbackState(true);
        const name = Util_1.getItem("name");
        let url = Constants_1.launch_url;
        let obj = getAuthQueryObject();
        // only send the plugin_token when registering for the 1st time
        if (!name) {
            obj["plugin_token"] = Util_1.getItem("jwt");
        }
        if (loginType === "github") {
            // github signup/login flow
            obj["redirect"] = Constants_1.launch_url;
            url = `${Constants_1.api_endpoint}/auth/github`;
        }
        else if (loginType === "google") {
            // google signup/login flow
            obj["redirect"] = Constants_1.launch_url;
            url = `${Constants_1.api_endpoint}/auth/google`;
        }
        else {
            // email login
            obj["token"] = Util_1.getItem("jwt");
            obj["auth"] = "software";
            url = `${Constants_1.launch_url}/onboarding`;
        }
        const qryStr = queryString.stringify(obj);
        updatedAuthAdded(false);
        setTimeout(() => {
            lazilyPollForAuth();
        }, 16000);
        return `${url}?${qryStr}`;
    });
}
exports.buildLoginUrl = buildLoginUrl;
/**
 * @param loginType "software" | "existing" | "google" | "github"
 */
function buildEmailSignup() {
    return __awaiter(this, void 0, void 0, function* () {
        let loginUrl = Constants_1.launch_url;
        let obj = getAuthQueryObject();
        obj["token"] = Util_1.getItem("jwt");
        obj["auth"] = "software";
        loginUrl = `${Constants_1.launch_url}/email-signup`;
        const qryStr = queryString.stringify(obj);
        updatedAuthAdded(false);
        setTimeout(() => {
            lazilyPollForAuth();
        }, 16000);
        return `${loginUrl}?${qryStr}`;
    });
}
exports.buildEmailSignup = buildEmailSignup;
function getAuthQueryObject() {
    let obj = {
        plugin: Util_1.getPluginType(),
        pluginVersion: Util_1.getVersion(),
        plugin_id: Util_1.getPluginId(),
        auth_callback_state: Util_1.getAuthCallbackState(true),
        plugin_uuid: Util_1.getPluginUuid(),
        login: true,
    };
    return obj;
}
//# sourceMappingURL=OnboardManager.js.map