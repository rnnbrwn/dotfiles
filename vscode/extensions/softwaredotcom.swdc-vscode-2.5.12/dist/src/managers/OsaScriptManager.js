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
exports.toggleDock = exports.toggleDockPosition = exports.isDarkMode = exports.toggleDarkMode = void 0;
const vscode_1 = require("vscode");
const Util_1 = require("../Util");
const ExecManager_1 = require("./ExecManager");
const cp = require("child_process");
function toggleDarkMode() {
    return __awaiter(this, void 0, void 0, function* () {
        Util_1.setItem("checked_sys_events", true);
        const darkModeCmd = `osascript -e \'
        tell application "System Events"
          tell appearance preferences
            set dark mode to not dark mode
          end tell
        end tell \'`;
        yield cp.exec(darkModeCmd);
        vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
    });
}
exports.toggleDarkMode = toggleDarkMode;
function isDarkMode() {
    return __awaiter(this, void 0, void 0, function* () {
        let isDarkMode = false;
        // first check to see if the user has "System Events" authorized
        const checked_sys_events = Util_1.getItem("checked_sys_events");
        if (checked_sys_events) {
            const getDarkModeFlag = `osascript -e \'
      try
        tell application "System Events"
          tell appearance preferences
            set t_info to dark mode
          end tell
        end tell
      on error
        return false
      end try\'`;
            const isDarkModeStr = ExecManager_1.execCmd(getDarkModeFlag);
            // convert it to a string
            if (isDarkModeStr !== undefined && isDarkModeStr !== null && isDarkModeStr !== "") {
                try {
                    isDarkMode = JSON.parse(`${isDarkModeStr}`);
                }
                catch (e) { }
            }
            else {
                // it's not defined, set it
                isDarkMode = false;
            }
        }
        return isDarkMode;
    });
}
exports.isDarkMode = isDarkMode;
// change the position of the dock depending on user input
function toggleDockPosition() {
    return __awaiter(this, void 0, void 0, function* () {
        Util_1.setItem("checked_sys_events", true);
        let newPosition = yield vscode_1.window.showInputBox({ placeHolder: "left, right, or bottom?" });
        function setPosition(position) {
            return `osascript -e \'
      tell application "System Events"
        tell dock preferences
          set properties to {screen edge:${position}}
        end tell
      end tell \'`;
        }
        if (newPosition) {
            cp.exec(setPosition(newPosition));
        }
    });
}
exports.toggleDockPosition = toggleDockPosition;
// hide and unhide the dock
function toggleDock() {
    return __awaiter(this, void 0, void 0, function* () {
        Util_1.setItem("checked_sys_events", true);
        let toggleDockCmd = `osascript -e \'
    tell application "System Events"
      tell dock preferences
        set x to autohide
        if x is false then
          set properties to {autohide:true}
        else
          set properties to {autohide:false}
        end if
      end tell
    end tell \'`;
        cp.exec(toggleDockCmd);
    });
}
exports.toggleDock = toggleDock;
function execPromise(command, opts = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            cp.exec(command, opts, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });
        });
    });
}
//# sourceMappingURL=OsaScriptManager.js.map