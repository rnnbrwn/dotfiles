const vscode = require('vscode');

async function getAllCssFiles(){
	let paths = [];
	const files = await vscode.workspace.findFiles('*.{css,sass}', '**​/node_modules/**');
	files.forEach(function(file){
		paths.push(file.path.replace("/c:/", "C:\\").toString());
	});

	return paths;
}

async function getAllDirectories(){
    let paths = [];

    const folders = vscode.workspace.workspaceFolders;

    folders.forEach(function(folder){
		paths.push(folder.uri.fsPath);
    });
    
    return paths;
}

module.exports = {getAllCssFiles, getAllDirectories}