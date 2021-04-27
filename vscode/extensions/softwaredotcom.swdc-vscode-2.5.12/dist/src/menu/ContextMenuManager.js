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
exports.switchAverageComparison = exports.showAverageComparisonOptions = void 0;
const vscode_1 = require("vscode");
const Util_1 = require("../Util");
const MenuManager_1 = require("./MenuManager");
function showAverageComparisonOptions() {
    return __awaiter(this, void 0, void 0, function* () {
        let menuOptions = {
            items: [],
            placeholder: `Select how to compare your stats progress`,
        };
        menuOptions.items.push({
            label: "Your daily average",
            value: "user",
        });
        menuOptions.items.push({
            label: "Global daily average",
            value: "global",
        });
        const pick = yield MenuManager_1.showQuickPick(menuOptions);
        if (pick && pick.value) {
            Util_1.setItem("reference-class", pick.value);
            // refresh the stats tree
            vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        }
        return null;
    });
}
exports.showAverageComparisonOptions = showAverageComparisonOptions;
function switchAverageComparison() {
    return __awaiter(this, void 0, void 0, function* () {
        let currentReferenceClass = Util_1.getItem("reference-class");
        if (!currentReferenceClass || currentReferenceClass === "user") {
            currentReferenceClass = "global";
        }
        else {
            currentReferenceClass = "user";
        }
        Util_1.setItem("reference-class", currentReferenceClass);
        // refresh the stats tree
        vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
    });
}
exports.switchAverageComparison = switchAverageComparison;
//# sourceMappingURL=ContextMenuManager.js.map