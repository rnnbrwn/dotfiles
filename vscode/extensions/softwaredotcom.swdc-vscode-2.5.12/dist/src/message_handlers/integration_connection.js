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
exports.handleIntegrationConnectionSocketEvent = void 0;
const vscode_1 = require("vscode");
const DataController_1 = require("../DataController");
const Util_1 = require("../Util");
function handleIntegrationConnectionSocketEvent(body) {
    return __awaiter(this, void 0, void 0, function* () {
        // integration_type_id = 14 (slack)
        // action = add, update, remove
        const { integration_type_id, integration_type, action } = body;
        if (integration_type_id === 14) {
            yield DataController_1.reconcileSlackIntegrations(yield DataController_1.getUser());
            if (action === "add") {
                // refresh the slack integrations
                // clear the auth callback state
                Util_1.setAuthCallbackState(null);
                showSuccessMessage("Successfully connected to Slack");
            }
            vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        }
    });
}
exports.handleIntegrationConnectionSocketEvent = handleIntegrationConnectionSocketEvent;
function showSuccessMessage(message) {
    vscode_1.window.withProgress({
        location: vscode_1.ProgressLocation.Notification,
        title: message,
        cancellable: false,
    }, (progress) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, 1000);
        });
    });
}
//# sourceMappingURL=integration_connection.js.map