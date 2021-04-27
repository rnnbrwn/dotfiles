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
exports.showDashboard = exports.showReportGenerator = void 0;
const vscode_1 = require("vscode");
const HttpClient_1 = require("../http/HttpClient");
const Util_1 = require("../Util");
let currentPanel = undefined;
let currentTitle = "";
function showReportGenerator() {
    return __awaiter(this, void 0, void 0, function* () {
        initiatePanel("Report Generator", "report_generator");
        const html = getReportGeneratorHtml();
        currentPanel.webview.html = html;
        currentPanel.reveal(vscode_1.ViewColumn.One);
    });
}
exports.showReportGenerator = showReportGenerator;
function showDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!Util_1.checkRegistrationForReport(true)) {
            return;
        }
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Loading dashboard...",
            cancellable: false,
        }, () => __awaiter(this, void 0, void 0, function* () {
            initiatePanel("Dashboard", "dashboard");
            const html = yield getDashboardHtml();
            currentPanel.webview.html = html;
            currentPanel.reveal(vscode_1.ViewColumn.One);
        }));
    });
}
exports.showDashboard = showDashboard;
function initiatePanel(title, viewType) {
    if (currentPanel && title !== currentTitle) {
        // dipose the previous one
        currentPanel.dispose();
    }
    currentTitle = title;
    if (!currentPanel) {
        currentPanel = vscode_1.window.createWebviewPanel(viewType, title, vscode_1.ViewColumn.One, { enableScripts: true });
        currentPanel.onDidDispose(() => {
            currentPanel = undefined;
        });
    }
    // commandMessage can be anything; object, number, string, etc
    currentPanel.webview.onDidReceiveMessage((commandMessage) => __awaiter(this, void 0, void 0, function* () {
        //
    }));
}
function getReportGeneratorHtml() {
    // fetch the html from the app
    return "<html><body><div>html goes here</div></body></html>";
}
function getDashboardHtml() {
    return __awaiter(this, void 0, void 0, function* () {
        const resp = yield HttpClient_1.softwareGet("/v1/plugin_dashboard", Util_1.getItem("jwt"));
        if (HttpClient_1.isResponseOk(resp)) {
            return resp.data.html;
        }
        else {
            vscode_1.window.showErrorMessage("Unable to generate dashboard. Please try again later.");
        }
    });
}
//# sourceMappingURL=WebViewManager.js.map