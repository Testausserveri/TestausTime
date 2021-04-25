const vscode = require('vscode');
const axios = require('axios');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const config = context.globalState;
	let apikey = config.get('apikey');
    let endpoint = config.get('endpoint', 'https://time.testausserveri.fi/api/v1');
	// Called when activated
	console.log('Testaustime activated!');

	// Must be defined in package.json
	let test = vscode.commands.registerCommand('testaustime.test', () => {
		vscode.window.showInformationMessage('Testaustime active!');
	});
	let setapikey = vscode.commands.registerCommand('testaustime.setapikey', async () => {
		const result = await vscode.window.showInputBox({
			placeHolder: 'Your API-key',
			validateInput: text => {
				return text.length != 48 ? 'API keys are 24 bits!' : null;
			}
		});
        if (!result || result.length != 48) return;
        vscode.window.showInformationMessage(`Testing API-key...`);
        axios.post(`${endpoint}/user/validateAPIKey`, {
            headers: {
                Authorization: `Bearer ${result}`
            }
        })
        .then((res) => {
            if (res.data.valid) {
                config.update('apikey', result);
                apikey = config.get('apikey');
                vscode.window.showInformationMessage(`API key set!`);
            } else {
                vscode.window.showInformationMessage(`API key invalid.`);
            }
        })
        .catch((e) => {
            vscode.window.showInformationMessage(`Error checking the API key validity. ${e}`);
        })
	});

    let setcustomapi = vscode.commands.registerCommand('testaustime.setcustomapi', async () => {
		const result = await vscode.window.showInputBox({
			placeHolder: 'https://time.testausserveri.fi/api/v1',
			validateInput: text => {
				return text.endsWith('/') ? 'Don\'t include the last slash' : null;
			}
		});
        if (!result || result.endsWith('/')) return;
        config.update('endpoint', result);
        endpoint = config.get('endpoint');
        vscode.window.showInformationMessage(`Endpoint key set!`);
	});

	context.subscriptions.push(test);
	context.subscriptions.push(setapikey);
    context.subscriptions.push(setcustomapi);
}

function deactivate() {
    // Called when deactivated
}

module.exports = {
    activate,
    deactivate
}
