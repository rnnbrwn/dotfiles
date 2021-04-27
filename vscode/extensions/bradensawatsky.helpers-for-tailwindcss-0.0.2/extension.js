
const vscode = require('vscode');
let editor = vscode.window.activeTextEditor;
const validater = require('./services/validation.js');
const component = require('./services/component.js');
const project = require('./services/project.js');
const formatter = require('./services/formatter');

async function extractCSSComponent(){
	try{
		const classes = editor.document.getText(editor.selection).split(' ');
		const file =  await vscode.window.showQuickPick(project.getAllCssFiles(), {canPickMany: false, placeHolder: "Choose css or sass file to add the new component to"});
		const componentName = await vscode.window.showInputBox({ prompt: "Name of component" });
		
		let invalidClasses = [];

		classes.forEach(async function(c){	
			if(!validater.validateCSSClassName(c)){
				invalidClasses.push(c);
			}
		});

		if(invalidClasses.length > 0){
			vscode.window.showErrorMessage("Selection contains a invalid class name: " + invalidClasses.join(" "));
		}
		else{
			if(validater.validateCSSClassName(componentName)){
				component.createCSSComponent(file, classes, componentName);

				editor = vscode.window.activeTextEditor;
				editor.edit(builder => {
					builder.replace(editor.selection, componentName);
				});
			}
			else{
				vscode.window.showErrorMessage("Component name is not a valid class name");
			}
		}	
	}
	catch(error){
		vscode.window.showErrorMessage("Exception caught: " + error);
	}
}

async function extractVueComponent(){
	try{
		const selection = editor.document.getText(editor.selection);
		const name = await vscode.window.showInputBox({ prompt: "Name of component" });

		if(validater.validateVueComponentName(name)){
			const path = await vscode.window.showQuickPick(project.getAllDirectories(), {canPickMany: false, placeHolder: "Choose folder to save component in"});
			component.createVUEComponent(path + "/" + name + ".vue", selection);
		}
		else{
			vscode.window.showErrorMessage("Component name is not a valid name");
		}

		editor = vscode.window.activeTextEditor;
		editor.edit(builder => {
			let k = formatter.formatCamelToKebab(name); 
			builder.replace(editor.selection, "<" + k + "></" + k + ">");
		});
	}
	catch(error){
		vscode.window.showErrorMessage("Exception caught: " + error);
	}
}

async function showTailwindDocumentation(){
	const panel = vscode.window.createWebviewPanel(
        'tailwindDocs',
        'Tailwind Documentation',
        vscode.ViewColumn.One,
        {
			enableScripts: true,
		}
	  );
	  
	panel.webview.html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<iframe style="width: 1280px; height: 920px" src="https://tailwindcss.com/">
		</iframe>
	</body>
	</html>`;
}

async function showTailwindPlayground(){
	const panel = vscode.window.createWebviewPanel(
        'tailwindPlayground',
        'Tailwind Playground',
        vscode.ViewColumn.One,
        {
			enableScripts: true,
		}
	  );
	  
	panel.webview.html = `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
	</head>
	<body>
		<iframe style="width: 1280px; height: 920px" src="https://play.tailwindcss.com/">
		</iframe>
	</body>
	</html>`;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let commands = [
		{
			name: 'tailwind-helpers.extractSelectionToCSS',
			handler: extractCSSComponent
		},
		{
			name: 'tailwind-helpers.extractSelectionToVue',
			handler: extractVueComponent
		},
		{
			name: 'tailwind-helpers.showTailwindDocumentation',
			handler: showTailwindDocumentation
		},
		{
			name: 'tailwind-helpers.showTailwindPlayground',
			handler: showTailwindPlayground
		}
	];

	commands.forEach(function(command){
		context.subscriptions.push(vscode.commands.registerCommand(command.name, command.handler));
	});
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
