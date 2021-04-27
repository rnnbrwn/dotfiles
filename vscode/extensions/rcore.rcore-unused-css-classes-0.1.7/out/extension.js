"use strict";
// r-core Technology
// 04/07/2019
// www.rcore.com
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    console.log('r-core Unused CSS Plugin is activated');
    let timeout = undefined;
    const styleFileExtensions = ['css', 'scss', 'sass'];
    const htmlFileExtensions = ['htm', 'html', 'jsx', 'js'];
    const cssFindRegEx = /([^\s]+).+(?=\s\{)/mgi;
    const fullHtmlTagsClassesRegEx = /(?<=id=")[^"]+|(?<=id=')[^']+|(?<=\[id\]=")[^"]+|(?<=\[id\]=')[^']+|(?<=<)[\w_-]+|(?<=[\[?ng]{0,2}class[Name]{0,4}\]?=")[^"]+|(?<=[\[?ng]{0,2}class[Name]{0,4}\]?=')[^']+|(?<=@include\s)[^\s]+/gmi;
    const unusedClassDecorationType = vscode.window.createTextEditorDecorationType({
        color: { id: 'rcore.unusedCssClassColor' }
    });
    let activeEditor = vscode.window.activeTextEditor;
    function loadHtmlDocuments(files) {
        const htmlDocuments = [];
        return new Promise(resolve => {
            Promise.all(files.map(file => vscode.workspace.openTextDocument(file)))
                .then((promisesResults) => {
                const openedFiles = [].concat(...promisesResults);
                openedFiles.forEach(openedFile => {
                    htmlDocuments.push(openedFile.getText());
                });
                resolve(htmlDocuments);
            });
        });
    }
    function isClassUsed(className, documents) {
        let found = false;
        documents.forEach(doc => {
            // const html = new HTMLBodyElement();
            // html.innerHTML = doc;
            // const found = html.querySelectorAll(className).length > 0;
            // html.remove();
            // if (found) {
            //	return true;
            // }
            // const search = doc.toLowerCase().indexOf(className.replace('.', '').replace('#', '').toLowerCase());
            // if (search && search > 0) {
            // 	found = true;
            // 	return;
            // }
            let match;
            let cssKeys = [];
            doc = doc.toLowerCase();
            let classNames = className.replace(/[#.]/gmi, '').toLowerCase().split(' ');
            while (match = fullHtmlTagsClassesRegEx.exec(doc)) {
                cssKeys.push(...match[0].replace(/["']/gmi, '').split(' '));
            }
            // removes from detection :focus, :nth-child, :hover, etc... 
            classNames = [...classNames.map(x => x.substring(0, x.lastIndexOf(":") === -1 ? x.length : x.lastIndexOf(":")))];
            // remove duplicates
            const uniqueKeys = new Set(cssKeys);
            classNames.forEach(className => {
                if (uniqueKeys.has(className)) {
                    found = true;
                    return;
                }
            });
        });
        return found;
    }
    function checkFiles(editor) {
        return new Promise((resolve, reject) => {
            try {
                const folder = editor.document.uri.path.substring(0, editor.document.uri.path.lastIndexOf("/"));
                if (folder && folder.length > 0) {
                    Promise.all(htmlFileExtensions.map(type => vscode.workspace.findFiles(new vscode.RelativePattern(folder, `**/*.${type}`))))
                        .then((searches) => {
                        const uris = [].concat(...searches);
                        resolve(uris);
                    });
                }
            }
            catch (error) {
                reject(error);
            }
        });
    }
    function isFileType(path, types) {
        const extension = path.substring(path.lastIndexOf('.') + 1, path.length);
        return types.find(elem => elem === extension) !== undefined;
    }
    function updateDecorations() {
        const editor = activeEditor ? activeEditor : undefined;
        if (!editor) {
            return;
        }
        // only style files
        if (!isFileType(editor.document.uri.path, styleFileExtensions)) {
            return;
        }
        const editorText = editor.document.getText();
        checkFiles(editor)
            .then(files => {
            const text = editorText;
            loadHtmlDocuments(files)
                .then((documents) => {
                if (documents.length > 0) {
                    const unusedClass = [];
                    let match;
                    while (match = cssFindRegEx.exec(text)) {
                        const matchValue = match[0].trim();
                        const startPos = editor.document.positionAt(match.index);
                        const endPos = editor.document.positionAt(match.index + matchValue.length);
                        const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Class **' + matchValue + '**' };
                        if (!isClassUsed(matchValue, documents)) {
                            unusedClass.push(decoration);
                            editor.setDecorations(unusedClassDecorationType, unusedClass);
                        }
                    }
                }
            });
        }).catch(error => {
            vscode.window.showErrorMessage(`Error: ${error}`);
        });
    }
    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(updateDecorations, 1000);
    }
    if (activeEditor) {
        triggerUpdateDecorations();
    }
    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map