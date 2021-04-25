const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Called when activated
	console.log('Testaustime activated!');

	// Must be defined in package.json
	let disposable = vscode.commands.registerCommand('testaustime.test', () => {
		vscode.window.showInformationMessage('Testaustime active!');
	});

	context.subscriptions.push(disposable);
}

function deactivate() {
	// Called when deactivated
}

module.exports = {
	activate,
	deactivate
}
