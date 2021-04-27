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
exports.checkRegistrationForReport = exports.noSpacesProjectDir = exports.getFileDataArray = exports.getFileDataAsJson = exports.getFileType = exports.showWarningMessage = exports.showInformationMessage = exports.humanizeMinutes = exports.formatNumber = exports.launchWebUrl = exports.launchWebDashboard = exports.normalizeGithubEmail = exports.randomCode = exports.getNowTimes = exports.coalesceNumber = exports.isNewDay = exports.getFormattedDay = exports.getOffsetSeconds = exports.showOfflinePrompt = exports.logIt = exports.logEvent = exports.getExtensionName = exports.openFileInEditor = exports.displayReadmeIfNotExists = exports.getLocalREADMEFile = exports.getSoftwareDir = exports.getSessionSummaryFile = exports.getIntegrationsFile = exports.getDailyReportSummaryFile = exports.getProjectContributorCodeSummaryFile = exports.getProjectCodeSummaryFile = exports.getSummaryInfoFile = exports.getGitEventFile = exports.getCommitSummaryFile = exports.getDashboardFile = exports.getTimeCounterFile = exports.getPluginEventsFile = exports.getSoftwareDataStoreFile = exports.getSoftwareSessionFile = exports.getDeviceFile = exports.getOsUsername = exports.getOs = exports.getHostname = exports.isMac = exports.isWindows = exports.isLinux = exports.setAuthCallbackState = exports.getAuthCallbackState = exports.getPluginUuid = exports.syncSlackIntegrations = exports.getIntegrations = exports.getItem = exports.setItem = exports.getProjectFolder = exports.getWorkspaceFolderByPath = exports.getRootPathForFile = exports.isFileOpen = exports.getNumberOfTextDocumentsOpen = exports.getFirstWorkspaceFolder = exports.getWorkspaceFolders = exports.findFirstActiveDirectoryOrWorkspaceDirectory = exports.isFileActive = exports.getActiveProjectWorkspace = exports.getFileAgeInDays = exports.isGitProject = exports.getVersion = exports.getPluginType = exports.getPluginName = exports.getPluginId = exports.getWorkspaceName = exports.MARKER_WIDTH = exports.TABLE_WIDTH = exports.DASHBOARD_LRG_COL_WIDTH = exports.DASHBOARD_COL_WIDTH = exports.DASHBOARD_VALUE_WIDTH = exports.DASHBOARD_LABEL_WIDTH = exports.alpha = void 0;
const vscode_1 = require("vscode");
const Constants_1 = require("./Constants");
const uuid_1 = require("uuid");
const SlackManager_1 = require("./managers/SlackManager");
const ExecManager_1 = require("./managers/ExecManager");
const fileIt = require("file-it");
const moment = require("moment-timezone");
const open = require("open");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const path = require("path");
exports.alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
exports.DASHBOARD_LABEL_WIDTH = 28;
exports.DASHBOARD_VALUE_WIDTH = 36;
exports.DASHBOARD_COL_WIDTH = 21;
exports.DASHBOARD_LRG_COL_WIDTH = 38;
exports.TABLE_WIDTH = 80;
exports.MARKER_WIDTH = 4;
const NUMBER_IN_EMAIL_REGEX = new RegExp("^\\d+\\+");
const dayFormat = "YYYY-MM-DD";
const dayTimeFormat = "LLLL";
let extensionName = null;
let workspace_name = null;
function getWorkspaceName() {
    if (!workspace_name) {
        workspace_name = randomCode();
    }
    return workspace_name;
}
exports.getWorkspaceName = getWorkspaceName;
function getPluginId() {
    return Constants_1.CODE_TIME_PLUGIN_ID;
}
exports.getPluginId = getPluginId;
function getPluginName() {
    return Constants_1.CODE_TIME_EXT_ID;
}
exports.getPluginName = getPluginName;
function getPluginType() {
    return Constants_1.CODE_TIME_TYPE;
}
exports.getPluginType = getPluginType;
function getVersion() {
    const extension = vscode_1.extensions.getExtension(Constants_1.CODE_TIME_EXT_ID);
    return extension.packageJSON.version;
}
exports.getVersion = getVersion;
function isGitProject(projectDir) {
    if (!projectDir) {
        return false;
    }
    const gitRemotesDir = path.join(projectDir, ".git", "refs", "remotes");
    if (!fs.existsSync(gitRemotesDir)) {
        return false;
    }
    return true;
}
exports.isGitProject = isGitProject;
/**
 * This method is sync, no need to await on it.
 * @param file
 */
function getFileAgeInDays(file) {
    if (!fs.existsSync(file)) {
        return 0;
    }
    const stat = fs.statSync(file);
    let creationTimeSec = stat.birthtimeMs || stat.ctimeMs;
    // convert to seconds
    creationTimeSec /= 1000;
    const daysDiff = moment.duration(moment().diff(moment.unix(creationTimeSec))).asDays();
    // if days diff is 0 then use 200, otherwise 100 per day, which is equal to a 9000 limit for 90 days
    return daysDiff > 1 ? parseInt(daysDiff, 10) : 1;
}
exports.getFileAgeInDays = getFileAgeInDays;
function getActiveProjectWorkspace() {
    const activeDocPath = findFirstActiveDirectoryOrWorkspaceDirectory();
    if (activeDocPath) {
        if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
            for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
                const workspaceFolder = vscode_1.workspace.workspaceFolders[i];
                const folderPath = workspaceFolder.uri.fsPath;
                if (activeDocPath.indexOf(folderPath) !== -1) {
                    return workspaceFolder;
                }
            }
        }
    }
    return null;
}
exports.getActiveProjectWorkspace = getActiveProjectWorkspace;
function isFileActive(file, isCloseEvent = false) {
    if (isCloseEvent)
        return true;
    if (vscode_1.workspace.textDocuments) {
        for (let i = 0; i < vscode_1.workspace.textDocuments.length; i++) {
            const doc = vscode_1.workspace.textDocuments[i];
            if (doc && doc.fileName === file) {
                return true;
            }
        }
    }
    return false;
}
exports.isFileActive = isFileActive;
function findFirstActiveDirectoryOrWorkspaceDirectory() {
    if (getNumberOfTextDocumentsOpen() > 0) {
        // check if the .software/CodeTime has already been opened
        for (let i = 0; i < vscode_1.workspace.textDocuments.length; i++) {
            let docObj = vscode_1.workspace.textDocuments[i];
            if (docObj.fileName) {
                const dir = getRootPathForFile(docObj.fileName);
                if (dir) {
                    return dir;
                }
            }
        }
    }
    const folder = getFirstWorkspaceFolder();
    if (folder) {
        return folder.uri.fsPath;
    }
    return "";
}
exports.findFirstActiveDirectoryOrWorkspaceDirectory = findFirstActiveDirectoryOrWorkspaceDirectory;
/**
 * These will return the workspace folders.
 * use the uri.fsPath to get the full path
 * use the name to get the folder name
 */
function getWorkspaceFolders() {
    let folders = [];
    if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
        for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
            let workspaceFolder = vscode_1.workspace.workspaceFolders[i];
            let folderUri = workspaceFolder.uri;
            if (folderUri && folderUri.fsPath) {
                folders.push(workspaceFolder);
            }
        }
    }
    return folders;
}
exports.getWorkspaceFolders = getWorkspaceFolders;
function getFirstWorkspaceFolder() {
    const workspaceFolders = getWorkspaceFolders();
    if (workspaceFolders && workspaceFolders.length) {
        return workspaceFolders[0];
    }
    return null;
}
exports.getFirstWorkspaceFolder = getFirstWorkspaceFolder;
function getNumberOfTextDocumentsOpen() {
    return vscode_1.workspace.textDocuments ? vscode_1.workspace.textDocuments.length : 0;
}
exports.getNumberOfTextDocumentsOpen = getNumberOfTextDocumentsOpen;
function isFileOpen(fileName) {
    if (getNumberOfTextDocumentsOpen() > 0) {
        // check if the .software/CodeTime has already been opened
        for (let i = 0; i < vscode_1.workspace.textDocuments.length; i++) {
            let docObj = vscode_1.workspace.textDocuments[i];
            if (docObj.fileName && docObj.fileName === fileName) {
                return true;
            }
        }
    }
    return false;
}
exports.isFileOpen = isFileOpen;
function getRootPathForFile(fileName) {
    let folder = getProjectFolder(fileName);
    if (folder) {
        return folder.uri.fsPath;
    }
    return null;
}
exports.getRootPathForFile = getRootPathForFile;
function getWorkspaceFolderByPath(path) {
    if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
        for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
            let workspaceFolder = vscode_1.workspace.workspaceFolders[i];
            if (path.includes(workspaceFolder.uri.fsPath)) {
                return workspaceFolder;
            }
        }
    }
    return null;
}
exports.getWorkspaceFolderByPath = getWorkspaceFolderByPath;
function getProjectFolder(fileName) {
    let liveshareFolder = null;
    if (vscode_1.workspace.workspaceFolders && vscode_1.workspace.workspaceFolders.length > 0) {
        for (let i = 0; i < vscode_1.workspace.workspaceFolders.length; i++) {
            let workspaceFolder = vscode_1.workspace.workspaceFolders[i];
            if (workspaceFolder.uri) {
                let isVslsScheme = workspaceFolder.uri.scheme === "vsls" ? true : false;
                if (isVslsScheme) {
                    liveshareFolder = workspaceFolder;
                }
                let folderUri = workspaceFolder.uri;
                if (folderUri && folderUri.fsPath && !isVslsScheme && fileName.includes(folderUri.fsPath)) {
                    return workspaceFolder;
                }
            }
        }
    }
    // wasn't found but if liveshareFolder was found, return that
    if (liveshareFolder) {
        return liveshareFolder;
    }
    return null;
}
exports.getProjectFolder = getProjectFolder;
function setItem(key, value) {
    fileIt.setJsonValue(getSoftwareSessionFile(), key, value);
}
exports.setItem = setItem;
function getItem(key) {
    return fileIt.getJsonValue(getSoftwareSessionFile(), key);
}
exports.getItem = getItem;
function getIntegrations() {
    let integrations = getFileDataAsJson(getIntegrationsFile());
    if (!integrations) {
        integrations = [];
        fileIt.writeJsonFileSync(getIntegrationsFile(), integrations);
    }
    const integrationsLen = integrations.length;
    // check to see if there are any [] values and remove them
    integrations = integrations.filter((n) => n && n.authId);
    if (integrations.length !== integrationsLen) {
        // update the file with the latest
        fileIt.writeJsonFileSync(getIntegrationsFile(), integrations);
    }
    return integrations;
}
exports.getIntegrations = getIntegrations;
function syncSlackIntegrations(integrations) {
    const nonSlackIntegrations = getIntegrations().filter((integration) => integration.name.toLowerCase() != "slack");
    integrations = (integrations === null || integrations === void 0 ? void 0 : integrations.length) ? [...integrations, ...nonSlackIntegrations] : nonSlackIntegrations;
    fileIt.writeJsonFileSync(getIntegrationsFile(), integrations);
}
exports.syncSlackIntegrations = syncSlackIntegrations;
function getPluginUuid() {
    let plugin_uuid = fileIt.getJsonValue(getDeviceFile(), "plugin_uuid");
    if (!plugin_uuid) {
        // set it for the 1st and only time
        plugin_uuid = uuid_1.v4();
        fileIt.setJsonValue(getDeviceFile(), "plugin_uuid", plugin_uuid);
    }
    return plugin_uuid;
}
exports.getPluginUuid = getPluginUuid;
function getAuthCallbackState(autoCreate = true) {
    let auth_callback_state = fileIt.getJsonValue(getDeviceFile(), "auth_callback_state");
    if (!auth_callback_state && autoCreate) {
        auth_callback_state = uuid_1.v4();
        setAuthCallbackState(auth_callback_state);
    }
    return auth_callback_state;
}
exports.getAuthCallbackState = getAuthCallbackState;
function setAuthCallbackState(value) {
    fileIt.setJsonValue(getDeviceFile(), "auth_callback_state", value);
}
exports.setAuthCallbackState = setAuthCallbackState;
function isLinux() {
    return isWindows() || isMac() ? false : true;
}
exports.isLinux = isLinux;
// process.platform return the following...
//   -> 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
function isWindows() {
    return process.platform.indexOf("win32") !== -1;
}
exports.isWindows = isWindows;
function isMac() {
    return process.platform.indexOf("darwin") !== -1;
}
exports.isMac = isMac;
function getHostname() {
    let hostname = ExecManager_1.execCmd("hostname");
    return hostname;
}
exports.getHostname = getHostname;
function getOs() {
    let parts = [];
    let osType = os.type();
    if (osType) {
        parts.push(osType);
    }
    let osRelease = os.release();
    if (osRelease) {
        parts.push(osRelease);
    }
    let platform = os.platform();
    if (platform) {
        parts.push(platform);
    }
    if (parts.length > 0) {
        return parts.join("_");
    }
    return "";
}
exports.getOs = getOs;
function getOsUsername() {
    return __awaiter(this, void 0, void 0, function* () {
        let username = os.userInfo().username;
        if (!username || username.trim() === "") {
            username = ExecManager_1.execCmd("whoami");
        }
        return username;
    });
}
exports.getOsUsername = getOsUsername;
function getFile(name) {
    let file_path = getSoftwareDir();
    if (isWindows()) {
        return `${file_path}\\${name}`;
    }
    return `${file_path}/${name}`;
}
function getDeviceFile() {
    return getFile("device.json");
}
exports.getDeviceFile = getDeviceFile;
function getSoftwareSessionFile() {
    return getFile("session.json");
}
exports.getSoftwareSessionFile = getSoftwareSessionFile;
function getSoftwareDataStoreFile() {
    return getFile("data.json");
}
exports.getSoftwareDataStoreFile = getSoftwareDataStoreFile;
function getPluginEventsFile() {
    return getFile("events.json");
}
exports.getPluginEventsFile = getPluginEventsFile;
function getTimeCounterFile() {
    return getFile("timeCounter.json");
}
exports.getTimeCounterFile = getTimeCounterFile;
function getDashboardFile() {
    return getFile("CodeTime.txt");
}
exports.getDashboardFile = getDashboardFile;
function getCommitSummaryFile() {
    return getFile("CommitSummary.txt");
}
exports.getCommitSummaryFile = getCommitSummaryFile;
function getGitEventFile() {
    return getFile("gitEvents.json");
}
exports.getGitEventFile = getGitEventFile;
function getSummaryInfoFile() {
    return getFile("SummaryInfo.txt");
}
exports.getSummaryInfoFile = getSummaryInfoFile;
function getProjectCodeSummaryFile() {
    return getFile("ProjectCodeSummary.txt");
}
exports.getProjectCodeSummaryFile = getProjectCodeSummaryFile;
function getProjectContributorCodeSummaryFile() {
    return getFile("ProjectContributorCodeSummary.txt");
}
exports.getProjectContributorCodeSummaryFile = getProjectContributorCodeSummaryFile;
function getDailyReportSummaryFile() {
    return getFile("DailyReportSummary.txt");
}
exports.getDailyReportSummaryFile = getDailyReportSummaryFile;
function getIntegrationsFile() {
    return getFile("integrations.json");
}
exports.getIntegrationsFile = getIntegrationsFile;
function getSessionSummaryFile() {
    return getFile("sessionSummary.json");
}
exports.getSessionSummaryFile = getSessionSummaryFile;
function getSoftwareDir(autoCreate = true) {
    const homedir = os.homedir();
    let softwareDataDir = homedir;
    if (isWindows()) {
        softwareDataDir += `\\${Constants_1.SOFTWARE_DIRECTORY}`;
    }
    else {
        softwareDataDir += `/${Constants_1.SOFTWARE_DIRECTORY}`;
    }
    if (autoCreate && !fs.existsSync(softwareDataDir)) {
        fs.mkdirSync(softwareDataDir);
    }
    return softwareDataDir;
}
exports.getSoftwareDir = getSoftwareDir;
function getLocalREADMEFile() {
    const resourcePath = path.join(__dirname, "resources");
    const file = path.join(resourcePath, "README.md");
    return file;
}
exports.getLocalREADMEFile = getLocalREADMEFile;
function displayReadmeIfNotExists(override = false) {
    const initialized_readme = getItem("vscode_CtReadme");
    if (!initialized_readme || override) {
        const readmeUri = vscode_1.Uri.file(getLocalREADMEFile());
        vscode_1.commands.executeCommand("markdown.showPreview", readmeUri, vscode_1.ViewColumn.One);
        setItem("vscode_CtReadme", true);
    }
}
exports.displayReadmeIfNotExists = displayReadmeIfNotExists;
function openFileInEditor(file) {
    vscode_1.workspace.openTextDocument(file).then((doc) => {
        // Show open document and set focus
        vscode_1.window.showTextDocument(doc, 1, false).then(undefined, (error) => {
            if (error.message) {
                vscode_1.window.showErrorMessage(error.message);
            }
            else {
                logIt(error);
            }
        });
    }, (error) => {
        if (error.message && error.message.toLowerCase().includes("file not found")) {
            vscode_1.window.showErrorMessage(`Cannot open ${file}.  File not found.`);
        }
        else {
            logIt(error);
        }
    });
}
exports.openFileInEditor = openFileInEditor;
function getExtensionName() {
    return "swdc-vscode";
}
exports.getExtensionName = getExtensionName;
function logEvent(message) {
    if (Constants_1.LOG_FILE_EVENTS) {
        console.log(`${getExtensionName()}: ${message}`);
    }
}
exports.logEvent = logEvent;
function logIt(message) {
    console.log(`${getExtensionName()}: ${message}`);
}
exports.logIt = logIt;
function showOfflinePrompt(addReconnectMsg = false) {
    return __awaiter(this, void 0, void 0, function* () {
        // shows a prompt that we're not able to communicate with the app server
        let infoMsg = "Our service is temporarily unavailable. ";
        if (addReconnectMsg) {
            infoMsg += "We will try to reconnect again in a minute. Your status bar will not update at this time.";
        }
        else {
            infoMsg += "Please try again later.";
        }
        // set the last update time so we don't try to ask too frequently
        vscode_1.window.showInformationMessage(infoMsg, ...["OK"]);
    });
}
exports.showOfflinePrompt = showOfflinePrompt;
function getOffsetSeconds() {
    let d = new Date();
    return d.getTimezoneOffset() * 60;
}
exports.getOffsetSeconds = getOffsetSeconds;
function getFormattedDay(unixSeconds) {
    return moment.unix(unixSeconds).format(dayFormat);
}
exports.getFormattedDay = getFormattedDay;
function isNewDay() {
    const { day } = getNowTimes();
    const currentDay = getItem("currentDay");
    return currentDay !== day ? true : false;
}
exports.isNewDay = isNewDay;
function coalesceNumber(val, defaultVal = 0) {
    if (val === null || val === undefined || isNaN(val)) {
        return defaultVal;
    }
    return val;
}
exports.coalesceNumber = coalesceNumber;
/**
 * now - current time in UTC (Moment object)
 * now_in_sec - current time in UTC, unix seconds
 * offset_in_sec - timezone offset from UTC (sign = -420 for Pacific Time)
 * local_now_in_sec - current time in UTC plus the timezone offset
 * utcDay - current day in UTC
 * day - current day in local TZ
 * localDayTime - current day in local TZ
 *
 * Example:
 * { day: "2020-04-07", localDayTime: "Tuesday, April 7, 2020 9:48 PM",
 * local_now_in_sec: 1586296107, now: "2020-04-08T04:48:27.120Z", now_in_sec: 1586321307,
 * offset_in_sec: -25200, utcDay: "2020-04-08" }
 */
function getNowTimes() {
    const now = moment.utc();
    const now_in_sec = now.unix();
    const offset_in_sec = moment().utcOffset() * 60;
    const local_now_in_sec = now_in_sec + offset_in_sec;
    const utcDay = now.format(dayFormat);
    const day = moment().format(dayFormat);
    const localDayTime = moment().format(dayTimeFormat);
    return {
        now,
        now_in_sec,
        offset_in_sec,
        local_now_in_sec,
        utcDay,
        day,
        localDayTime,
    };
}
exports.getNowTimes = getNowTimes;
function randomCode() {
    return crypto
        .randomBytes(16)
        .map((value) => exports.alpha.charCodeAt(Math.floor((value * exports.alpha.length) / 256)))
        .toString();
}
exports.randomCode = randomCode;
function normalizeGithubEmail(email, filterOutNonEmails = true) {
    if (email) {
        if (filterOutNonEmails && (email.endsWith("github.com") || email.includes("users.noreply"))) {
            return null;
        }
        else {
            const found = email.match(NUMBER_IN_EMAIL_REGEX);
            if (found && email.includes("users.noreply")) {
                // filter out the ones that look like
                // 2342353345+username@users.noreply.github.com"
                return null;
            }
        }
    }
    return email;
}
exports.normalizeGithubEmail = normalizeGithubEmail;
function launchWebDashboard() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!checkRegistration()) {
            return;
        }
        // add the token=jwt
        const jwt = getItem("jwt");
        const encodedJwt = encodeURIComponent(jwt);
        const webUrl = `${Constants_1.launch_url}?token=${encodedJwt}`;
        launchWebUrl(webUrl);
    });
}
exports.launchWebDashboard = launchWebDashboard;
function launchWebUrl(url) {
    open(url);
}
exports.launchWebUrl = launchWebUrl;
function checkRegistration() {
    if (!getItem("name")) {
        vscode_1.window
            .showInformationMessage("Sign up or log in to see more data visualizations.", {
            modal: true,
        }, Constants_1.SIGN_UP_LABEL)
            .then((selection) => __awaiter(this, void 0, void 0, function* () {
            if (selection === Constants_1.SIGN_UP_LABEL) {
                vscode_1.commands.executeCommand("codetime.signUpAccount");
            }
        }));
        return false;
    }
    return true;
}
function formatNumber(num) {
    let str = "";
    num = num ? parseFloat(num) : 0;
    if (num >= 1000) {
        str = num.toLocaleString();
    }
    else if (num % 1 === 0) {
        str = num.toFixed(0);
    }
    else {
        str = num.toFixed(2);
    }
    return str;
}
exports.formatNumber = formatNumber;
/**
 * humanize the minutes
 */
function humanizeMinutes(min) {
    min = parseInt(min, 0) || 0;
    let str = "";
    if (min === 60) {
        str = "1h";
    }
    else if (min > 60) {
        const hours = Math.floor(min / 60);
        const minutes = min % 60;
        const hoursStr = Math.floor(hours).toFixed(0) + "h";
        if ((parseFloat(min) / 60) % 1 === 0) {
            str = hoursStr;
        }
        else {
            str = `${hoursStr} ${minutes}m`;
        }
    }
    else if (min === 1) {
        str = "1m";
    }
    else {
        // less than 60 seconds
        str = min.toFixed(0) + "m";
    }
    return str;
}
exports.humanizeMinutes = humanizeMinutes;
function showInformationMessage(message) {
    return vscode_1.window.showInformationMessage(`${message}`);
}
exports.showInformationMessage = showInformationMessage;
function showWarningMessage(message) {
    return vscode_1.window.showWarningMessage(`${message}`);
}
exports.showWarningMessage = showWarningMessage;
function getFileType(fileName) {
    let fileType = "";
    const lastDotIdx = fileName.lastIndexOf(".");
    const len = fileName.length;
    if (lastDotIdx !== -1 && lastDotIdx < len - 1) {
        fileType = fileName.substring(lastDotIdx + 1);
    }
    return fileType;
}
exports.getFileType = getFileType;
function getFileDataAsJson(file) {
    return fileIt.readJsonFileSync(file);
}
exports.getFileDataAsJson = getFileDataAsJson;
function getFileDataArray(file) {
    let payloads = fileIt.readJsonArraySync(file);
    return payloads;
}
exports.getFileDataArray = getFileDataArray;
function noSpacesProjectDir(projectDir) {
    return projectDir.replace(/^\s+/g, "");
}
exports.noSpacesProjectDir = noSpacesProjectDir;
function checkRegistrationForReport(showSignup = true) {
    if (!getItem("name")) {
        if (showSignup) {
            SlackManager_1.showModalSignupPrompt("Unlock your personalized dashboard and visualize your coding activity. Create an account to get started.");
        }
        return false;
    }
    return true;
}
exports.checkRegistrationForReport = checkRegistrationForReport;
//# sourceMappingURL=Util.js.map