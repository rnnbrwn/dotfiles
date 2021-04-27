"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CtTreeItem = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const resourcePath = path.join(__dirname, "resources");
class CtTreeItem extends vscode_1.TreeItem {
    constructor(label, tooltip = "", description = "", iconName = "") {
        super(label, vscode_1.TreeItemCollapsibleState.None);
        this.value = undefined;
        this.iconName = "";
        this.children = null;
        this.id = "";
        this.iconPath = {
            light: "",
            dark: "",
        };
        this.tooltip = tooltip !== null && tooltip !== void 0 ? tooltip : label.toString();
        this.description = description;
        this.iconName = iconName;
        const { lightPath, darkPath } = getTreeItemIcon(this.iconName);
        if (lightPath && darkPath) {
            this.iconPath.light = lightPath;
            this.iconPath.dark = darkPath;
        }
        else {
            // no matching tag, remove the tree item icon path
            delete this.iconPath;
        }
    }
}
exports.CtTreeItem = CtTreeItem;
function getTreeItemIcon(iconName) {
    const lightPath = iconName ? path.join(resourcePath, "light", iconName) : null;
    const darkPath = iconName ? path.join(resourcePath, "dark", iconName) : null;
    return { lightPath, darkPath };
}
//# sourceMappingURL=CtTreeItem.js.map