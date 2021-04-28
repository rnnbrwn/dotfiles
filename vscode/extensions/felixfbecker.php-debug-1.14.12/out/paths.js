"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSameUri = exports.convertClientPathToDebugger = exports.convertDebuggerPathToClient = void 0;
const fileUrl = require("file-url");
const url = __importStar(require("url"));
const path = __importStar(require("path"));
const urlencode_1 = require("urlencode");
const relateurl_1 = __importDefault(require("relateurl"));
/**
 * Options to make sure that RelateUrl only outputs relative URLs and performs not other "smart" modifications.
 * They would mess up things like prefix checking.
 */
const RELATE_URL_OPTIONS = {
    // Make sure RelateUrl does not prefer root-relative URLs if shorter
    output: relateurl_1.default.PATH_RELATIVE,
    // Make sure RelateUrl does not remove trailing slash if present
    removeRootTrailingSlash: false,
    // Make sure RelateUrl does not remove default ports
    defaultPorts: {},
};
/**
 * Like `path.relative()` but for URLs.
 * Inverse of `url.resolve()` or `new URL(relative, base)`.
 */
const relativeUrl = (from, to) => relateurl_1.default.relate(from, to, RELATE_URL_OPTIONS);
/** converts a server-side Xdebug file URI to a local path for VS Code with respect to source root settings */
function convertDebuggerPathToClient(fileUri, pathMapping) {
    let localSourceRoot;
    let serverSourceRoot;
    if (typeof fileUri === 'string') {
        fileUri = url.parse(fileUri);
    }
    // convert the file URI to a path
    let serverPath = urlencode_1.decode(fileUri.pathname);
    // strip the trailing slash from Windows paths (indicated by a drive letter with a colon)
    const serverIsWindows = /^\/[a-zA-Z]:\//.test(serverPath);
    if (serverIsWindows) {
        serverPath = serverPath.substr(1);
    }
    if (pathMapping) {
        for (const mappedServerPath of Object.keys(pathMapping)) {
            const mappedLocalSource = pathMapping[mappedServerPath];
            // normalize slashes for windows-to-unix
            const serverRelative = (serverIsWindows ? path.win32 : path.posix).relative(mappedServerPath, serverPath);
            if (serverRelative.indexOf('..') !== 0) {
                // If a matching mapping has previously been found, only update
                // it if the current server path is longer than the previous one
                // (longest prefix matching)
                if (!serverSourceRoot || mappedServerPath.length > serverSourceRoot.length) {
                    serverSourceRoot = mappedServerPath;
                    localSourceRoot = mappedLocalSource;
                }
            }
        }
    }
    let localPath;
    if (serverSourceRoot && localSourceRoot) {
        const clientIsWindows = /^[a-zA-Z]:\\/.test(localSourceRoot) ||
            /^\\\\/.test(localSourceRoot) ||
            /^[a-zA-Z]:$/.test(localSourceRoot) ||
            /^[a-zA-Z]:\//.test(localSourceRoot);
        // get the part of the path that is relative to the source root
        let pathRelativeToSourceRoot = (serverIsWindows ? path.win32 : path.posix).relative(serverSourceRoot, serverPath);
        if (serverIsWindows && !clientIsWindows) {
            pathRelativeToSourceRoot = pathRelativeToSourceRoot.replace(/\\/g, path.posix.sep);
        }
        if (clientIsWindows && /^[a-zA-Z]:$/.test(localSourceRoot)) {
            // if local source root mapping is only drive letter, add backslash
            localSourceRoot += '\\';
        }
        // resolve from the local source root
        localPath = (clientIsWindows ? path.win32 : path.posix).resolve(localSourceRoot, pathRelativeToSourceRoot);
    }
    else {
        localPath = (serverIsWindows ? path.win32 : path.posix).normalize(serverPath);
    }
    return localPath;
}
exports.convertDebuggerPathToClient = convertDebuggerPathToClient;
/** converts a local path from VS Code to a server-side Xdebug file URI with respect to source root settings */
function convertClientPathToDebugger(localPath, pathMapping) {
    let localSourceRoot;
    let serverSourceRoot;
    // Xdebug always lowercases Windows drive letters in file URIs
    let localFileUri = fileUrl(localPath.replace(/^[A-Z]:\\/, match => match.toLowerCase()), { resolve: false });
    let serverFileUri;
    if (pathMapping) {
        for (const mappedServerPath of Object.keys(pathMapping)) {
            let mappedLocalSource = pathMapping[mappedServerPath];
            if (/^[a-zA-Z]:$/.test(mappedLocalSource)) {
                // if local source root mapping is only drive letter, add backslash
                mappedLocalSource += '\\';
            }
            const localRelative = path.relative(mappedLocalSource, localPath);
            if (localRelative.indexOf('..') !== 0) {
                // If a matching mapping has previously been found, only update
                // it if the current local path is longer than the previous one
                // (longest prefix matching)
                if (!localSourceRoot || mappedLocalSource.length > localSourceRoot.length) {
                    serverSourceRoot = mappedServerPath;
                    localSourceRoot = mappedLocalSource;
                }
            }
        }
    }
    if (localSourceRoot) {
        localSourceRoot = localSourceRoot.replace(/^[A-Z]:$/, match => match.toLowerCase());
        localSourceRoot = localSourceRoot.replace(/^[A-Z]:\\/, match => match.toLowerCase());
        localSourceRoot = localSourceRoot.replace(/^[A-Z]:\//, match => match.toLowerCase());
    }
    if (serverSourceRoot) {
        serverSourceRoot = serverSourceRoot.replace(/^[A-Z]:$/, match => match.toLowerCase());
        serverSourceRoot = serverSourceRoot.replace(/^[A-Z]:\\/, match => match.toLowerCase());
        serverSourceRoot = serverSourceRoot.replace(/^[A-Z]:\//, match => match.toLowerCase());
    }
    if (serverSourceRoot && localSourceRoot) {
        let localSourceRootUrl = fileUrl(localSourceRoot, { resolve: false });
        if (!localSourceRootUrl.endsWith('/')) {
            localSourceRootUrl += '/';
        }
        let serverSourceRootUrl = fileUrl(serverSourceRoot, { resolve: false });
        if (!serverSourceRootUrl.endsWith('/')) {
            serverSourceRootUrl += '/';
        }
        // get the part of the path that is relative to the source root
        const urlRelativeToSourceRoot = relativeUrl(localSourceRootUrl, localFileUri);
        // resolve from the server source root
        serverFileUri = url.resolve(serverSourceRootUrl, urlRelativeToSourceRoot);
    }
    else {
        serverFileUri = localFileUri;
    }
    return serverFileUri;
}
exports.convertClientPathToDebugger = convertClientPathToDebugger;
function isWindowsUri(path) {
    return /^file:\/\/\/[a-zA-Z]:\//.test(path);
}
function isSameUri(clientUri, debuggerUri) {
    if (isWindowsUri(clientUri) || isWindowsUri(debuggerUri)) {
        // compare case-insensitive on Windows
        return debuggerUri.toLowerCase() === clientUri.toLowerCase();
    }
    else {
        return debuggerUri === clientUri;
    }
}
exports.isSameUri = isSameUri;
//# sourceMappingURL=paths.js.map