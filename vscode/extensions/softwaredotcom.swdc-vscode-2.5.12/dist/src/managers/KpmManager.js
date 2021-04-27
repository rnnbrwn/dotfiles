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
exports.KpmManager = void 0;
const vscode_1 = require("vscode");
const KeystrokeStats_1 = require("../model/KeystrokeStats");
const Constants_1 = require("../Constants");
const Util_1 = require("../Util");
const models_1 = require("../model/models");
const FileManager_1 = require("./FileManager");
const Project_1 = require("../model/Project");
const PluginDataManager_1 = require("./PluginDataManager");
const DataController_1 = require("../DataController");
const TrackerManager_1 = require("./TrackerManager");
const fs = require("fs");
let _keystrokeMap = {};
let _staticInfoMap = {};
class KpmManager {
    constructor() {
        let subscriptions = [];
        this.tracker = TrackerManager_1.TrackerManager.getInstance();
        // document listener handlers
        subscriptions.push(vscode_1.workspace.onDidOpenTextDocument(this._onOpenHandler, this));
        subscriptions.push(vscode_1.workspace.onDidCloseTextDocument(this._onCloseHandler, this));
        subscriptions.push(vscode_1.workspace.onDidChangeTextDocument(this._onEventHandler, this));
        subscriptions.push(vscode_1.workspace.onDidSaveTextDocument(this._onSaveHandler, this));
        // window state changed handler
        subscriptions.push(vscode_1.window.onDidChangeWindowState(this._windowStateChanged, this));
        const workspaceFolder = Util_1.getFirstWorkspaceFolder();
        if (workspaceFolder) {
            // Watch .git directory changes
            // Only works if the git directory is in the workspace
            const localGitWatcher = vscode_1.workspace.createFileSystemWatcher(new vscode_1.RelativePattern(workspaceFolder, "{**/.git/refs/heads/**}"));
            const remoteGitWatcher = vscode_1.workspace.createFileSystemWatcher(new vscode_1.RelativePattern(workspaceFolder, "{**/.git/refs/remotes/**}"));
            subscriptions.push(localGitWatcher);
            subscriptions.push(remoteGitWatcher);
            subscriptions.push(localGitWatcher.onDidChange(this._onCommitHandler, this));
            subscriptions.push(remoteGitWatcher.onDidChange(this._onCommitHandler, this));
            subscriptions.push(remoteGitWatcher.onDidCreate(this._onCommitHandler, this));
            subscriptions.push(remoteGitWatcher.onDidDelete(this._onBranchDeleteHandler, this));
        }
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    static getInstance() {
        if (!KpmManager.instance) {
            KpmManager.instance = new KpmManager();
        }
        return KpmManager.instance;
    }
    hasKeystrokeData() {
        return _keystrokeMap && Object.keys(_keystrokeMap).length ? true : false;
    }
    sendKeystrokeDataIntervalHandler(isUnfocus = false) {
        return __awaiter(this, void 0, void 0, function* () {
            //
            // Go through all keystroke count objects found in the map and send
            // the ones that have data (data is greater than 1), then clear the map
            //
            if (this.hasKeystrokeData()) {
                let keys = Object.keys(_keystrokeMap);
                // use a normal for loop since we have an await within the loop
                for (let key of keys) {
                    const keystrokeStats = _keystrokeMap[key];
                    // check if we have keystroke data
                    if (keystrokeStats.hasData()) {
                        // post the payload offline until the batch interval sends it out
                        keystrokeStats.postData(isUnfocus);
                    }
                }
            }
            // clear out the keystroke map
            _keystrokeMap = {};
            // clear out the static info map
            _staticInfoMap = {};
        });
    }
    _windowStateChanged(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event.focused) {
                PluginDataManager_1.PluginDataManager.getInstance().editorFocusHandler();
                this.tracker.trackEditorAction("editor", "focus");
            }
            else {
                // Process this window's keystroke data since the window has become unfocused
                vscode_1.commands.executeCommand("codetime.processKeystrokeData");
                this.tracker.trackEditorAction("editor", "unfocus");
            }
        });
    }
    /**
     * File Close Handler
     * @param event
     */
    _onCloseHandler(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event || !vscode_1.window.state.focused) {
                return;
            }
            const filename = this.getFileName(event);
            if (!this.isTrueEventFile(event, filename, true)) {
                return;
            }
            this.tracker.trackEditorAction("file", "close", event);
        });
    }
    /**
     * File Open Handler
     * @param event
     */
    _onOpenHandler(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event || !vscode_1.window.state.focused) {
                return;
            }
            const filename = this.getFileName(event);
            if (!this.isTrueEventFile(event, filename)) {
                return;
            }
            this.tracker.trackEditorAction("file", "open", event);
            const staticInfo = yield this.getStaticEventInfo(event, filename);
            let rootPath = Util_1.getRootPathForFile(staticInfo.filename);
            if (!rootPath) {
                rootPath = Constants_1.NO_PROJ_NAME;
            }
            yield this.initializeKeystrokesCount(staticInfo.filename, rootPath);
            // make sure other files end's are set
            this.endPreviousModifiedFiles(staticInfo.filename, rootPath);
            const rootObj = _keystrokeMap[rootPath];
            this.updateStaticValues(rootObj, staticInfo);
            rootObj.source[staticInfo.filename].open += 1;
            Util_1.logEvent(`File opened`);
        });
    }
    _onSaveHandler(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tracker.trackEditorAction("file", "save", event);
        });
    }
    _onCommitHandler(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (DataController_1.getPreference("disableGitData") === true)
                return;
            // Branches with naming style of "feature/fix_the_thing" will fire an
            // event when the /feature directory is created. Check if file.
            const stat = fs.statSync(event.path);
            if (!(stat === null || stat === void 0 ? void 0 : stat.isFile()))
                return;
            if (event.path.includes("/.git/refs/heads/")) {
                // /.git/refs/heads/<branch_name>
                const branch = event.path.split(".git/")[1];
                let commit;
                try {
                    commit = fs.readFileSync(event.path, "utf8").trimEnd();
                }
                catch (err) {
                    Util_1.logIt(`Error reading ${event.path}: ${err.message}`);
                }
                this.tracker.trackGitLocalEvent("local_commit", branch, commit);
            }
            else if (event.path.includes("/.git/refs/remotes/")) {
                // /.git/refs/remotes/<branch_name>
                this.tracker.trackGitRemoteEvent(event);
            }
        });
    }
    _onBranchDeleteHandler(event) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tracker.trackGitDeleteEvent(event);
        });
    }
    /**
     * File Change Event Handler
     * @param event
     */
    _onEventHandler(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!event || !vscode_1.window.state.focused) {
                return;
            }
            const filename = this.getFileName(event);
            if (!this.isTrueEventFile(event, filename)) {
                return;
            }
            const staticInfo = yield this.getStaticEventInfo(event, filename);
            let rootPath = Util_1.getRootPathForFile(filename);
            if (!rootPath) {
                rootPath = Constants_1.NO_PROJ_NAME;
            }
            yield this.initializeKeystrokesCount(filename, rootPath);
            if (!_keystrokeMap[rootPath].source[filename]) {
                // it's undefined, it wasn't created
                return;
            }
            const rootObj = _keystrokeMap[rootPath];
            const sourceObj = rootObj.source[staticInfo.filename];
            this.updateStaticValues(rootObj, staticInfo);
            // find the contentChange with a range in the contentChanges array
            // THIS CAN HAVE MULTIPLE CONTENTCHANGES WITH RANGES AT ONE TIME.
            // LOOP THROUGH AND REPEAT COUNTS
            const contentChanges = event.contentChanges.filter((change) => change.range);
            // each changeset is triggered by a single keystroke
            if (contentChanges.length > 0)
                sourceObj.keystrokes += 1;
            for (let contentChange of contentChanges) {
                // get {linesAdded, linesDeleted, charactersDeleted, charactersAdded, changeType}
                const documentChangeCountsAndType = this.analyzeDocumentChange(contentChange);
                // get {hasChanges, linesAdded, linesDeleted, isCharDelete, textChangeLen, hasNonNewLineData}
                const textChangeInfo = this.getTextChangeInfo(contentChange);
                sourceObj.documentChangeInfo.linesAdded += documentChangeCountsAndType.linesAdded;
                sourceObj.documentChangeInfo.linesDeleted += documentChangeCountsAndType.linesDeleted;
                sourceObj.documentChangeInfo.charactersAdded += documentChangeCountsAndType.charactersAdded;
                sourceObj.documentChangeInfo.charactersDeleted += documentChangeCountsAndType.charactersDeleted;
                switch (documentChangeCountsAndType.changeType) {
                    case "singleDelete": {
                        sourceObj.documentChangeInfo.singleDeletes += 1;
                        break;
                    }
                    case "multiDelete": {
                        sourceObj.documentChangeInfo.multiDeletes += 1;
                        break;
                    }
                    case "singleAdd": {
                        sourceObj.documentChangeInfo.singleAdds += 1;
                        break;
                    }
                    case "multiAdd": {
                        sourceObj.documentChangeInfo.multiAdds += 1;
                        break;
                    }
                    case "autoIndent": {
                        sourceObj.documentChangeInfo.autoIndents += 1;
                        break;
                    }
                    case "replacement": {
                        sourceObj.documentChangeInfo.replacements += 1;
                        break;
                    }
                }
                if (textChangeInfo.textChangeLen > 4) {
                    // 4 is the threshold here due to typical tab size of 4 spaces
                    // it's a copy and paste event
                    sourceObj.paste += 1;
                    sourceObj.charsPasted += textChangeInfo.textChangeLen;
                    Util_1.logEvent("Copy+Paste Incremented");
                }
                else if (textChangeInfo.textChangeLen < 0) {
                    sourceObj.delete += 1;
                    // update the overall count
                }
                else if (textChangeInfo.hasNonNewLineData) {
                    // update the data for this fileInfo keys count
                    sourceObj.add += 1;
                    // update the overall count
                    Util_1.logEvent("charsAdded incremented");
                    Util_1.logEvent("addEvents incremented");
                }
                // increment keystrokes by 1
                rootObj.keystrokes += 1;
                // "netkeys" = add - delete
                sourceObj.netkeys = sourceObj.add - sourceObj.delete;
                sourceObj.lines = event.document && event.document.lineCount ? event.document.lineCount : event.lineCount || 0;
                if (textChangeInfo.linesDeleted) {
                    Util_1.logEvent(`Removed ${textChangeInfo.linesDeleted} lines`);
                    sourceObj.linesRemoved += textChangeInfo.linesDeleted;
                }
                else if (textChangeInfo.linesAdded) {
                    Util_1.logEvent(`Added ${textChangeInfo.linesAdded} lines`);
                    sourceObj.linesAdded += textChangeInfo.linesAdded;
                }
            }
            this.updateLatestPayloadLazily(rootObj);
        });
    }
    updateLatestPayloadLazily(payload) {
        if (this._currentPayloadTimeout) {
            // cancel the current one
            clearTimeout(this._currentPayloadTimeout);
            this._currentPayloadTimeout = null;
        }
        this._currentPayloadTimeout = setTimeout(() => {
            this.updateLatestPayload(payload);
        }, 2000);
    }
    updateLatestPayload(payload) {
        FileManager_1.storeCurrentPayload(payload);
    }
    /**
     * Update some of the basic/static attributes
     * @param sourceObj
     * @param staticInfo
     */
    updateStaticValues(payload, staticInfo) {
        const sourceObj = payload.source[staticInfo.filename];
        if (!sourceObj) {
            return;
        }
        // syntax
        if (!sourceObj.syntax) {
            sourceObj.syntax = staticInfo.languageId;
        }
        // fileAgeDays
        if (!sourceObj.fileAgeDays) {
            sourceObj.fileAgeDays = staticInfo.fileAgeDays;
        }
        // length
        sourceObj.length = staticInfo.length;
    }
    getFileName(event) {
        let filename = "";
        if (event.fileName) {
            filename = event.fileName;
        }
        else if (event.document && event.document.fileName) {
            filename = event.document.fileName;
        }
        return filename;
    }
    analyzeDocumentChange(contentChange) {
        const info = {
            linesAdded: 0,
            linesDeleted: 0,
            charactersDeleted: 0,
            charactersAdded: 0,
            changeType: "",
        };
        // extract lines and character change counts
        this.extractChangeCounts(info, contentChange);
        this.characterizeChange(info, contentChange);
        return info;
    }
    extractChangeCounts(changeInfo, contentChange) {
        var _a, _b;
        changeInfo.linesDeleted = contentChange.range.end.line - contentChange.range.start.line;
        changeInfo.linesAdded = ((_b = (_a = contentChange.text) === null || _a === void 0 ? void 0 : _a.match(/[\n\r]/g)) === null || _b === void 0 ? void 0 : _b.length) || 0;
        changeInfo.charactersDeleted = contentChange.rangeLength - changeInfo.linesDeleted;
        changeInfo.charactersAdded = contentChange.text.length - changeInfo.linesAdded;
    }
    characterizeChange(changeInfo, contentChange) {
        var _a;
        if (changeInfo.charactersDeleted > 0 || changeInfo.linesDeleted > 0) {
            if (changeInfo.charactersAdded > 0)
                changeInfo.changeType = "replacement";
            else if (changeInfo.charactersDeleted > 1 || changeInfo.linesDeleted > 1)
                changeInfo.changeType = "multiDelete";
            else if (changeInfo.charactersDeleted == 1 || changeInfo.linesDeleted == 1)
                changeInfo.changeType = "singleDelete";
        }
        else if (changeInfo.charactersAdded > 1 || changeInfo.linesAdded > 1) {
            if (((_a = contentChange.text.match(/^[\n\r]\s*$/)) === null || _a === void 0 ? void 0 : _a.length) == 1) {
                // the regex matches a text that is a newline followed by only whitespace
                changeInfo.charactersAdded = 0;
                changeInfo.changeType = "autoIndent";
            }
            else
                changeInfo.changeType = "multiAdd";
        }
        else if (changeInfo.charactersAdded == 1 || changeInfo.linesAdded == 1)
            changeInfo.changeType = "singleAdd";
    }
    /**
     * Get the text change info:
     * linesAdded, linesDeleted, isCharDelete,
     * hasNonNewLineData, textChangeLen, hasChanges
     * @param contentChange
     */
    getTextChangeInfo(contentChange) {
        const info = {
            linesAdded: 0,
            linesDeleted: 0,
            isCharDelete: false,
            hasNonNewLineData: false,
            textChangeLen: 0,
            hasChanges: false,
        };
        let textChangeLen = 0;
        // Get the range data
        const rangeData = JSON.parse(JSON.stringify(contentChange));
        let linesChanged = 0;
        if (rangeData.range && rangeData.range.length) {
            // get the number of lines that have changed
            linesChanged = rangeData.range[1].line - rangeData.range[0].line;
        }
        const rangeText = contentChange.text;
        const newLineMatches = rangeText === null || rangeText === void 0 ? void 0 : rangeText.match(/[\n\r]/g);
        textChangeLen = rangeText === null || rangeText === void 0 ? void 0 : rangeText.length;
        // set the text change length
        info.textChangeLen = textChangeLen;
        if (linesChanged) {
            // update removed lines
            info.linesDeleted = linesChanged;
        }
        else if (newLineMatches && !linesChanged && textChangeLen) {
            // this means there are new lines added
            info.linesAdded = newLineMatches.length;
        }
        else if (contentChange.rangeLength && !rangeText) {
            // this may be a character delete
            info.isCharDelete = true;
        }
        // check if its a character deletion
        if (!textChangeLen && contentChange.rangeLength) {
            // NO content text but has a range change length, set the textChangeLen
            // to the inverse of the rangeLength to show the chars deleted
            info.textChangeLen = contentChange.rangeLength / -1;
        }
        if (info.textChangeLen && !info.linesAdded && !info.linesDeleted) {
            // flag to state we have chars deleted but no new lines
            info.hasNonNewLineData = true;
        }
        if (info.linesAdded || info.linesDeleted || info.textChangeLen || info.isCharDelete) {
            // there are changes
            info.hasChanges = true;
        }
        return info;
    }
    getStaticEventInfo(event, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            if (_staticInfoMap[filename]) {
                return _staticInfoMap[filename];
            }
            const textDoc = event.document || event;
            const languageId = textDoc.languageId || textDoc.fileName.split(".").slice(-1)[0];
            let length = 0;
            if (typeof textDoc.getText === "function") {
                length = textDoc.getText().length;
            }
            const lineCount = textDoc.lineCount || 0;
            // get the age of this file
            const fileAgeDays = Util_1.getFileAgeInDays(filename);
            _staticInfoMap[filename] = {
                filename,
                languageId,
                length,
                fileAgeDays,
                lineCount,
            };
            return _staticInfoMap[filename];
        });
    }
    /**
     * This will return true if it's a true file. we don't
     * want to send events for .git or other event triggers
     * such as extension.js.map events
     */
    isTrueEventFile(event, filename, isCloseEvent = false) {
        if (!filename) {
            return false;
        }
        // if it's the dashboard file or a liveshare tmp file then
        // skip event tracking
        let scheme = "";
        if (event.uri && event.uri.scheme) {
            scheme = event.uri.scheme;
        }
        else if (event.document && event.document.uri && event.document.uri.scheme) {
            scheme = event.document.uri.scheme;
        }
        // we'll get "git" as a scheme, but these are the schemes that match to open files in the editor
        const isDocEventScheme = scheme === "file" || scheme === "untitled" || scheme === "vscode-remote";
        const isLiveshareTmpFile = filename.match(/.*\.code-workspace.*vsliveshare.*tmp-.*/);
        const isInternalFile = filename.match(/.*\.software.*(CommitSummary\.txt|CodeTime\.txt|session\.json|ProjectCodeSummary\.txt|data.json)/);
        // return false that its not a doc that we want to track based on the
        // following conditions: non-doc scheme, is liveshare tmp file, is internal file
        // and the file is no longer active
        if (!isDocEventScheme || isLiveshareTmpFile || isInternalFile || !Util_1.isFileActive(filename, isCloseEvent)) {
            return false;
        }
        return true;
    }
    endPreviousModifiedFiles(filename, rootPath) {
        let keystrokeStats = _keystrokeMap[rootPath];
        if (keystrokeStats) {
            // close any existing
            const fileKeys = Object.keys(keystrokeStats.source);
            const nowTimes = Util_1.getNowTimes();
            if (fileKeys.length) {
                // set the end time to now for the other files that don't match this file
                fileKeys.forEach((key) => {
                    let sourceObj = keystrokeStats.source[key];
                    if (key !== filename && sourceObj.end === 0) {
                        sourceObj.end = nowTimes.now_in_sec;
                        sourceObj.local_end = nowTimes.local_now_in_sec;
                    }
                });
            }
        }
    }
    initializeKeystrokesCount(filename, rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // the rootPath (directory) is used as the map key, must be a string
            rootPath = rootPath || Constants_1.NO_PROJ_NAME;
            // if we don't even have a _keystrokeMap then create it and take the
            // path of adding this file with a start time of now
            if (!_keystrokeMap) {
                _keystrokeMap = {};
            }
            const nowTimes = Util_1.getNowTimes();
            let keystrokeStats = _keystrokeMap[rootPath];
            // create the keystroke count if it doesn't exist
            if (!keystrokeStats) {
                // add keystroke count wrapper
                keystrokeStats = yield this.createKeystrokeStats(filename, rootPath, nowTimes);
            }
            // check if we have this file or not
            const hasFile = keystrokeStats.source[filename];
            if (!hasFile) {
                // no file, start anew
                this.addFile(filename, nowTimes, keystrokeStats);
            }
            else if (parseInt(keystrokeStats.source[filename].end, 10) !== 0) {
                // re-initialize it since we ended it before the minute was up
                keystrokeStats.source[filename].end = 0;
                keystrokeStats.source[filename].local_end = 0;
            }
            _keystrokeMap[rootPath] = keystrokeStats;
        });
    }
    addFile(filename, nowTimes, keystrokeStats) {
        const fileInfo = new models_1.FileChangeInfo();
        fileInfo.start = nowTimes.now_in_sec;
        fileInfo.local_start = nowTimes.local_now_in_sec;
        keystrokeStats.source[filename] = fileInfo;
    }
    createKeystrokeStats(filename, rootPath, nowTimes) {
        return __awaiter(this, void 0, void 0, function* () {
            // start off with an empty project
            const p = new Project_1.default();
            const keystrokeStats = new KeystrokeStats_1.default(p);
            keystrokeStats.start = nowTimes.now_in_sec;
            keystrokeStats.local_start = nowTimes.local_now_in_sec;
            keystrokeStats.keystrokes = 0;
            // start the minute timer to send the data
            const timeout = Constants_1.DEFAULT_DURATION_MILLIS;
            this._keystrokeTriggerTimeout = setTimeout(() => {
                this.sendKeystrokeDataIntervalHandler();
            }, timeout);
            return keystrokeStats;
        });
    }
    processKeystrokeData(isUnfocus = false) {
        if (this._keystrokeTriggerTimeout) {
            clearTimeout(this._keystrokeTriggerTimeout);
        }
        this.sendKeystrokeDataIntervalHandler(isUnfocus);
    }
    dispose() {
        this._disposable.dispose();
    }
}
exports.KpmManager = KpmManager;
//# sourceMappingURL=KpmManager.js.map