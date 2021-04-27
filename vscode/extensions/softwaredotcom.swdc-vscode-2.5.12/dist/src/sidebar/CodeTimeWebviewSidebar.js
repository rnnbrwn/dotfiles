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
exports.CodeTimeWebviewSidebar = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const ReactData_1 = require("./ReactData");
const ScreenManager_1 = require("../managers/ScreenManager");
const Util_1 = require("../Util");
class CodeTimeWebviewSidebar {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        this._onDidClose = new vscode_1.EventEmitter();
        //
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._webview) {
                // its not available to refresh yet
                return;
            }
            this._webview.webview.html = yield this.getReactHtml();
        });
    }
    get onDidClose() {
        return this._onDidClose.event;
    }
    // this is called when a view first becomes visible. This may happen when the view is first loaded
    // or when the user hides and then shows a view again
    resolveWebviewView(webviewView, context, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._webview) {
                this._webview = webviewView;
            }
            this._webview.webview.options = {
                // Allow scripts in the webview
                enableScripts: true,
                enableCommandUris: true,
                localResourceRoots: [this._extensionUri],
            };
            this._disposable = vscode_1.Disposable.from(this._webview.onDidDispose(this.onWebviewDisposed, this));
            this._webview.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                switch (message.command) {
                    case "command_execute":
                        if ((_a = message.arguments) === null || _a === void 0 ? void 0 : _a.length) {
                            vscode_1.commands.executeCommand(message.action, ...message.arguments);
                        }
                        else {
                            vscode_1.commands.executeCommand(message.action);
                        }
                        break;
                    case "update_screen_mode":
                        ScreenManager_1.updateScreenMode(message.value);
                }
            }));
            this.loadWebview();
        });
    }
    loadWebview(tries = 10) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Util_1.getItem("jwt") || tries <= 0) {
                this._webview.webview.html = yield this.getReactHtml();
            }
            else {
                tries--;
                setTimeout(() => {
                    this.loadWebview(tries);
                }, 2000);
            }
        });
    }
    getReactHtml() {
        return __awaiter(this, void 0, void 0, function* () {
            const reactAppPathOnDisk = vscode_1.Uri.file(path.join(__dirname, "webviewSidebar.js"));
            const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });
            const stateData = JSON.stringify(yield ReactData_1.getReactData());
            return `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Config View</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans,
              Droid Sans, Helvetica Neue, sans-serif;
              background-color: transparent !important;
            }
          </style>
          <meta http-equiv="Content-Security-Policy"
                      content="default-src 'none';
                              img-src https:;
                              script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
                              style-src vscode-resource: 'unsafe-inline';">
          <script>
            window.acquireVsCodeApi = acquireVsCodeApi;
            window.stateData = ${stateData}
          </script>
      </head>
      <body>
          <div id="root"></div>
          <script src="${reactAppUri}"></script>
      </body>
      </html>`;
        });
    }
    dispose() {
        this._disposable && this._disposable.dispose();
    }
    onWebviewDisposed() {
        this._onDidClose.fire();
    }
    get viewColumn() {
        // this._view._panel.viewColumn;
        return undefined;
    }
    get visible() {
        return this._webview ? this._webview.visible : false;
    }
}
exports.CodeTimeWebviewSidebar = CodeTimeWebviewSidebar;
//# sourceMappingURL=CodeTimeWebviewSidebar.js.map