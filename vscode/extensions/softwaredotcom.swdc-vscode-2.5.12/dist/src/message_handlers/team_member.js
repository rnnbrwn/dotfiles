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
exports.handleTeamMemberSocketEvent = void 0;
const vscode_1 = require("vscode");
function handleTeamMemberSocketEvent(body) {
    return __awaiter(this, void 0, void 0, function* () {
        // status = created | invited | accepted | active | inactive (left the team)
        // action = add, update, remove
        const { status, action } = body;
        if (status === "active" || status === "inactive") {
            vscode_1.commands.executeCommand("codetime.reloadTeams");
        }
    });
}
exports.handleTeamMemberSocketEvent = handleTeamMemberSocketEvent;
//# sourceMappingURL=team_member.js.map