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
exports.getResourceInfo = exports.getRepoContributorInfo = void 0;
const Util_1 = require("../Util");
const RepoContributorInfo_1 = require("../model/RepoContributorInfo");
const TeamMember_1 = require("../model/TeamMember");
const CacheManager_1 = require("../cache/CacheManager");
const ExecManager_1 = require("../managers/ExecManager");
const cacheMgr = CacheManager_1.CacheManager.getInstance();
const cacheTimeoutSeconds = 60 * 10;
function getProjectDir(fileName = null) {
    let workspaceFolders = Util_1.getWorkspaceFolders();
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return null;
    }
    // VSCode allows having multiple workspaces.
    // for now we only support using the 1st project directory
    // in a given set of workspaces if the provided fileName is null.
    if (workspaceFolders && workspaceFolders.length > 0) {
        if (!fileName) {
            return workspaceFolders[0].uri.fsPath;
        }
        for (let i = 0; i < workspaceFolders.length; i++) {
            const dir = workspaceFolders[i].uri.fsPath;
            if (fileName.includes(dir)) {
                return dir;
            }
        }
    }
    return null;
}
function getRepoContributorInfo(fileName, filterOutNonEmails = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const directory = getProjectDir(fileName);
        if (!directory || !Util_1.isGitProject(directory)) {
            return null;
        }
        const noSpacesProjDir = directory.replace(/^\s+/g, "");
        const cacheId = `project-repo-contributor-info-${noSpacesProjDir}`;
        let repoContributorInfo = cacheMgr.get(cacheId);
        // return from cache if we have it
        if (repoContributorInfo) {
            return repoContributorInfo;
        }
        repoContributorInfo = new RepoContributorInfo_1.default();
        // get the repo url, branch, and tag
        let resourceInfo = yield getResourceInfo(directory);
        if (resourceInfo && resourceInfo.identifier) {
            repoContributorInfo.identifier = resourceInfo.identifier;
            repoContributorInfo.tag = resourceInfo.tag;
            repoContributorInfo.branch = resourceInfo.branch;
            // username, email
            let cmd = `git log --format='%an,%ae' | sort -u`;
            // get the author name and email
            let resultList = ExecManager_1.execCmd(cmd, directory, true);
            if (!resultList) {
                // something went wrong, but don't try to parse a null or undefined str
                return repoContributorInfo;
            }
            let map = {};
            if (resultList.length) {
                // count name email
                resultList.forEach((listInfo) => {
                    const devInfo = listInfo.split(",");
                    const name = devInfo[0];
                    const email = Util_1.normalizeGithubEmail(devInfo[1], filterOutNonEmails);
                    if (email && !map[email]) {
                        const teamMember = new TeamMember_1.default();
                        teamMember.name = name;
                        teamMember.email = email;
                        teamMember.identifier = resourceInfo.identifier;
                        repoContributorInfo.members.push(teamMember);
                        map[email] = email;
                    }
                });
            }
            repoContributorInfo.count = repoContributorInfo.members.length;
        }
        if (repoContributorInfo && repoContributorInfo.count > 0) {
            cacheMgr.set(cacheId, repoContributorInfo, cacheTimeoutSeconds);
        }
        return repoContributorInfo;
    });
}
exports.getRepoContributorInfo = getRepoContributorInfo;
//
// use "git symbolic-ref --short HEAD" to get the git branch
// use "git config --get remote.origin.url" to get the remote url
function getResourceInfo(projectDir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!projectDir || !Util_1.isGitProject(projectDir)) {
            return null;
        }
        const noSpacesProjDir = projectDir.replace(/^\s+/g, "");
        const cacheId = `resource-info-${noSpacesProjDir}`;
        let resourceInfo = cacheMgr.get(cacheId);
        // return from cache if we have it
        if (resourceInfo) {
            return resourceInfo;
        }
        resourceInfo = {};
        const branch = ExecManager_1.execCmd("git symbolic-ref --short HEAD", projectDir);
        const identifier = ExecManager_1.execCmd("git config --get remote.origin.url", projectDir);
        let email = ExecManager_1.execCmd("git config user.email", projectDir);
        const tag = ExecManager_1.execCmd("git describe --all", projectDir);
        // both should be valid to return the resource info
        if (branch && identifier) {
            resourceInfo = { branch, identifier, email, tag };
            cacheMgr.set(cacheId, resourceInfo, cacheTimeoutSeconds);
        }
        return resourceInfo;
    });
}
exports.getResourceInfo = getResourceInfo;
//# sourceMappingURL=KpmRepoManager.js.map