const vscode = require('vscode');
const fileCreator = require('./file_creator');

async function activate() {
	try {
		// Load configuration from settingsSync instead of local file
		const vscodeConfig = vscode.workspace.getConfiguration('ai-ignore');
		const ignoreFiles = vscodeConfig.get('ignoreFiles', []);

		// Create ignore files if they don't exist
		for (const ignoreFile of ignoreFiles) {
			if (ignoreFile.enabled && ignoreFile.createIfNotExists) {
				await fileCreator.createIgnoreFile(ignoreFile.path);
			}
		}

		vscode.window.showInformationMessage('AI Ignore Helper: Ignore files checked/created successfully!');
	} catch (error) {
		vscode.window.showErrorMessage(`Error activating AI Ignore Helper: ${error.message}`);
	}
}

module.exports = activate;
