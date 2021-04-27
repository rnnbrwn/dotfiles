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
exports.getEditSettingsHtml = exports.configureSettings = exports.showingConfigureSettingsPanel = void 0;
const vscode_1 = require("vscode");
const DataController_1 = require("../DataController");
const HttpClient_1 = require("../http/HttpClient");
const Util_1 = require("../Util");
let currentPanel = undefined;
function showingConfigureSettingsPanel() {
    return !!currentPanel;
}
exports.showingConfigureSettingsPanel = showingConfigureSettingsPanel;
function configureSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        if (currentPanel) {
            // dipose the previous one. always use the same tab
            currentPanel.dispose();
        }
        if (!currentPanel) {
            currentPanel = vscode_1.window.createWebviewPanel("edit_settings", "Code Time Settings", vscode_1.ViewColumn.One, { enableScripts: true });
            currentPanel.onDidDispose(() => {
                currentPanel = undefined;
            });
            currentPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
                yield DataController_1.initializePreferences();
                if (currentPanel) {
                    // dipose it
                    currentPanel.dispose();
                }
            }));
        }
        currentPanel.webview.html = yield getEditSettingsHtml();
        currentPanel.reveal(vscode_1.ViewColumn.One);
    });
}
exports.configureSettings = configureSettings;
function getEditSettingsHtml() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield HttpClient_1.softwareGet(`/users/me/edit_preferences`, Util_1.getItem("jwt"), {
            isLightMode: vscode_1.window.activeColorTheme.kind == 1,
            editor: "vscode",
        });
        if (HttpClient_1.isResponseOk(resp)) {
            return resp.data.html;
        }
        else {
            vscode_1.window.showErrorMessage("Unable to generate view. Please try again later.");
        }
    });
}
exports.getEditSettingsHtml = getEditSettingsHtml;
//# sourceMappingURL=ConfigManager.js.map