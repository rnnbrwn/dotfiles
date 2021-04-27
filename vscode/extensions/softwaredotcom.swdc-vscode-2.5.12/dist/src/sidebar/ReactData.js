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
exports.getReactData = void 0;
const extension_1 = require("../extension");
const FlowManager_1 = require("../managers/FlowManager");
const SlackManager_1 = require("../managers/SlackManager");
const StatusBarManager_1 = require("../managers/StatusBarManager");
const TeamManager_1 = require("../managers/TeamManager");
const Util_1 = require("../Util");
/**
 * Returns:
 * authType: string (github, google, software),
 * registered: boolean,
 * email: string,
 * slackConnected: boolean
 * inFlowMode: boolean,
 * statusBarTextVisible: boolean,
 * slackWorkspaces: [slack integrations],
 * currentColorKind: number (2=dark, anything else is non-dark),
 * teams: [teams]
 */
function getReactData() {
    return __awaiter(this, void 0, void 0, function* () {
        const name = Util_1.getItem("name");
        const authType = Util_1.getItem("authType");
        return {
            authType,
            registered: !!name,
            email: name,
            inFlowMode: yield FlowManager_1.isFlowModEnabled(),
            slackConnected: !!SlackManager_1.hasSlackWorkspaces(),
            statusBarTextVisible: StatusBarManager_1.isStatusBarTextVisible(),
            slackWorkspaces: SlackManager_1.getSlackWorkspaces(),
            currentColorKind: extension_1.getCurrentColorKind(),
            teams: yield TeamManager_1.getCachedTeams(),
            skipSlackConnect: Util_1.getItem("vscode_CtskipSlackConnect"),
        };
    });
}
exports.getReactData = getReactData;
//# sourceMappingURL=ReactData.js.map