"use strict";
// Copyright (c) 2018 Software. All Rights Reserved.
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
exports.getCurrentColorKind = exports.intializePlugin = exports.activate = exports.deactivate = exports.isTelemetryOn = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const DataController_1 = require("./DataController");
const OnboardManager_1 = require("./user/OnboardManager");
const Util_1 = require("./Util");
const command_helper_1 = require("./command-helper");
const KpmManager_1 = require("./managers/KpmManager");
const PluginDataManager_1 = require("./managers/PluginDataManager");
const WallClockManager_1 = require("./managers/WallClockManager");
const TrackerManager_1 = require("./managers/TrackerManager");
const websockets_1 = require("./websockets");
const HttpClient_1 = require("./http/HttpClient");
const ConfigManager_1 = require("./managers/ConfigManager");
const StatusBarManager_1 = require("./managers/StatusBarManager");
let TELEMETRY_ON = true;
let currentColorKind = undefined;
let liveshare_update_interval = null;
const tracker = TrackerManager_1.TrackerManager.getInstance();
//
// Add the keystroke controller to the ext ctx, which
// will then listen for text document changes.
//
const kpmController = KpmManager_1.KpmManager.getInstance();
function isTelemetryOn() {
    return TELEMETRY_ON;
}
exports.isTelemetryOn = isTelemetryOn;
function deactivate(ctx) {
    // Process this window's keystroke data since the window has become unfocused/deactivated
    vscode_1.commands.executeCommand("codetime.processKeystrokeData");
    // store the deactivate event
    tracker.trackEditorAction("editor", "deactivate");
    // dispose the new day timer
    PluginDataManager_1.PluginDataManager.getInstance().dispose();
    WallClockManager_1.WallClockManager.getInstance().dispose();
    clearInterval(liveshare_update_interval);
    websockets_1.clearWebsocketConnectionRetryTimeout();
}
exports.deactivate = deactivate;
function activate(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        // add the code time commands
        ctx.subscriptions.push(command_helper_1.createCommands(ctx, kpmController));
        // onboard the user as anonymous if it's being installed
        if (vscode_1.window.state.focused) {
            OnboardManager_1.onboardInit(ctx, intializePlugin /*successFunction*/);
        }
        else {
            // 9 to 20 second delay
            const secondDelay = getRandomArbitrary(9, 20);
            // initialize in 5 seconds if this is the secondary window
            setTimeout(() => {
                OnboardManager_1.onboardInit(ctx, intializePlugin /*successFunction*/);
            }, 1000 * secondDelay);
        }
    });
}
exports.activate = activate;
function getRandomArbitrary(min, max) {
    max = max + 0.1;
    return parseInt(Math.random() * (max - min) + min, 10);
}
function intializePlugin(ctx, createdAnonUser) {
    return __awaiter(this, void 0, void 0, function* () {
        Util_1.logIt(`Loaded ${Util_1.getPluginName()} v${Util_1.getVersion()}`);
        try {
            websockets_1.initializeWebsockets();
        }
        catch (e) {
            console.error("Failed to initialize websockets", e);
        }
        yield tracker.init();
        // store the activate event
        tracker.trackEditorAction("editor", "activate");
        activateColorKindChangeListener();
        // INIT the plugin data manager
        PluginDataManager_1.PluginDataManager.getInstance();
        // initialize the wall clock timer
        WallClockManager_1.WallClockManager.getInstance();
        // initialize preferences
        yield DataController_1.initializePreferences();
        const initializedVscodePlugin = Util_1.getItem("vscode_CtInit");
        if (!initializedVscodePlugin) {
            Util_1.setItem("vscode_CtInit", true);
            setTimeout(() => {
                vscode_1.commands.executeCommand("codetime.displaySidebar");
            }, 1000);
            // activate the plugin
            HttpClient_1.softwarePost("/plugins/activate", {}, Util_1.getItem("jwt"));
        }
        // show the readme if it doesn't exist
        Util_1.displayReadmeIfNotExists();
        // show the status bar text info
        setTimeout(() => {
            StatusBarManager_1.initializeStatusBar();
            StatusBarManager_1.updateStatusBarWithSummaryData();
        }, 0);
    });
}
exports.intializePlugin = intializePlugin;
function getCurrentColorKind() {
    if (!currentColorKind) {
        currentColorKind = vscode_1.window.activeColorTheme.kind;
    }
    return currentColorKind;
}
exports.getCurrentColorKind = getCurrentColorKind;
/**
 * Active color theme listener
 */
function activateColorKindChangeListener() {
    currentColorKind = vscode_1.window.activeColorTheme.kind;
    vscode_1.window.onDidChangeActiveColorTheme((event) => {
        let kindChanged = false;
        if (event.kind !== currentColorKind) {
            kindChanged = true;
        }
        currentColorKind = event.kind;
        if (kindChanged) {
            // check if the config panel is showing, update it if so
            if (ConfigManager_1.showingConfigureSettingsPanel()) {
                setTimeout(() => {
                    ConfigManager_1.configureSettings();
                }, 500);
            }
        }
        // let the sidebar know the new current color kind
        setTimeout(() => {
            vscode_1.commands.executeCommand("codetime.refreshCodeTimeView");
        }, 250);
    });
}
//# sourceMappingURL=extension.js.map