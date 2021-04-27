"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInFullScreenMode = exports.isInZenMode = exports.showNormalScreenMode = exports.showFullScreenMode = exports.showZenMode = exports.getScreenMode = exports.updateScreenMode = exports.FULL_SCREEN_MODE_ID = exports.ZEN_MODE_ID = exports.NORMAL_SCREEN_MODE = void 0;
const vscode_1 = require("vscode");
exports.NORMAL_SCREEN_MODE = 0;
exports.ZEN_MODE_ID = 1;
exports.FULL_SCREEN_MODE_ID = 2;
let screenMode = 0;
function updateScreenMode(screen_mode) {
    screenMode = screen_mode;
}
exports.updateScreenMode = updateScreenMode;
function getScreenMode() {
    return screenMode;
}
exports.getScreenMode = getScreenMode;
function showZenMode() {
    if (screenMode !== exports.ZEN_MODE_ID) {
        screenMode = exports.ZEN_MODE_ID;
        vscode_1.commands.executeCommand("workbench.action.toggleZenMode");
        return true;
    }
    return false;
}
exports.showZenMode = showZenMode;
function showFullScreenMode() {
    if (screenMode !== exports.FULL_SCREEN_MODE_ID) {
        vscode_1.commands.executeCommand("workbench.action.toggleFullScreen");
        screenMode = exports.FULL_SCREEN_MODE_ID;
        return true;
    }
    return false;
}
exports.showFullScreenMode = showFullScreenMode;
function showNormalScreenMode() {
    if (screenMode !== exports.NORMAL_SCREEN_MODE) {
        if (screenMode === exports.FULL_SCREEN_MODE_ID) {
            screenMode = exports.NORMAL_SCREEN_MODE;
            vscode_1.commands.executeCommand("workbench.action.toggleFullScreen");
            return true;
        }
        else if (screenMode === exports.ZEN_MODE_ID) {
            screenMode = exports.NORMAL_SCREEN_MODE;
            vscode_1.commands.executeCommand("workbench.action.toggleZenMode");
            return true;
        }
    }
    return false;
}
exports.showNormalScreenMode = showNormalScreenMode;
function isInZenMode() {
    return !!(screenMode === exports.ZEN_MODE_ID);
}
exports.isInZenMode = isInZenMode;
function isInFullScreenMode() {
    return !!(screenMode === exports.FULL_SCREEN_MODE_ID);
}
exports.isInFullScreenMode = isInFullScreenMode;
//# sourceMappingURL=ScreenManager.js.map