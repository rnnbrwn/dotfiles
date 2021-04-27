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
exports.showEndOfDayNotification = exports.setEndOfDayNotification = void 0;
const vscode_1 = require("vscode");
const WebViewManager_1 = require("../managers/WebViewManager");
const Util_1 = require("../Util");
const HttpClient_1 = require("../http/HttpClient");
const ConfigManager_1 = require("../managers/ConfigManager");
const TrackerManager_1 = require("../managers/TrackerManager");
const TreeButtonProvider_1 = require("../tree/TreeButtonProvider");
const moment = require("moment-timezone");
let timer = undefined;
exports.setEndOfDayNotification = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // clear any existing timer
    if (timer) {
        clearTimeout(timer);
    }
    // If the end of day notification setting is turned on (if undefined or null, will default to true)
    if (((_b = (_a = user === null || user === void 0 ? void 0 : user.preferences) === null || _a === void 0 ? void 0 : _a.notifications) === null || _b === void 0 ? void 0 : _b.endOfDayNotification) !== false) {
        const jwt = Util_1.getItem("jwt");
        if (jwt) {
            // get the user's work hours from their profile
            const response = yield HttpClient_1.softwareGet("/users/profile", jwt);
            if (HttpClient_1.isResponseOk(response) && ((_c = response.data) === null || _c === void 0 ? void 0 : _c.work_hours)) {
                // get the m-f work hours
                const workHours = response.data.work_hours.map((workHours) => {
                    return buildStartEndFormatsOfUnixTuple(workHours);
                });
                // get milliseconds until the end of the day
                const now = moment().tz(Intl.DateTimeFormat().resolvedOptions().timeZone);
                const todaysWorkHours = workHours.find((wh) => wh.day === now.format("dddd"));
                let msUntilEndOfTheDay = 0;
                // check if todays work hours are set since its not set on weekends
                if (!todaysWorkHours || !todaysWorkHours.end) {
                    const nowHour = now.hour();
                    msUntilEndOfTheDay = (17 - nowHour) * 60 * 60 * 1000;
                }
                else {
                    const { end } = todaysWorkHours;
                    msUntilEndOfTheDay = end.valueOf() - now.valueOf();
                }
                // if the end of the day is in the future...
                if (msUntilEndOfTheDay > 0) {
                    // set a timer to show the end of day notification at the end of the day
                    timer = setTimeout(exports.showEndOfDayNotification, msUntilEndOfTheDay);
                }
            }
            else {
                console.error("[CodeTime] error response from /users/profile", response);
            }
        }
    }
});
exports.showEndOfDayNotification = () => __awaiter(void 0, void 0, void 0, function* () {
    const tracker = TrackerManager_1.TrackerManager.getInstance();
    const selection = yield vscode_1.window.showInformationMessage("It's the end of your work day! Would you like to see your code time stats for today?", ...["Settings", "Show me the data"]);
    if (selection === "Show me the data") {
        let item = TreeButtonProvider_1.showMeTheDataKpmItem();
        tracker.trackUIInteraction(item);
        WebViewManager_1.showDashboard();
    }
    else if (selection === "Settings") {
        let item = TreeButtonProvider_1.configureSettingsKpmItem();
        tracker.trackUIInteraction(item);
        ConfigManager_1.configureSettings();
    }
});
const buildStartEndFormatsOfUnixTuple = (tuple, startOfUnit = "week") => {
    if (!tuple || tuple.length !== 2) {
        return {};
    }
    // get the 1st timestamp as the start
    let start = tuple[0];
    // get the 2nd one as the end of the time range
    let end = tuple[1];
    // create the moment start and end starting from
    // the beginning of the week as the unix timestamp
    // is the number of seconds since the beginning of the week.
    let momentStart = moment().startOf(startOfUnit).add(start, "seconds");
    let momentEnd = moment().startOf(startOfUnit).add(end, "seconds");
    // return as an example: {"9:00am", "6:00pm", "Friday"}
    return {
        start: momentStart,
        end: momentEnd,
        day: momentStart.format("dddd"),
    };
};
//# sourceMappingURL=endOfDay.js.map