const vscode = require('vscode');
const configManager = require('./config_manager');
const ignoreHandler = require('./ignore_handler');

async function addToIgnore(resourceUri) {
	try {
		if (!resourceUri) {
			vscode.window.showErrorMessage('No resource selected');
			return;
		}
		
		// Load configuration
		const config = configManager.loadConfig();
		if (!config) {
			return;
		}
		
		// Filter enabled ignore files
		const enabledIgnoreFiles = config.ignoreFiles.filter(file => file.enabled);
		
		if (enabledIgnoreFiles.length === 0) {
			vscode.window.showInformationMessage('No ignore files are enabled in the configuration');
			return;
		}
		
		let selectedFiles = [];
		
		// Show selection menu if configured to do so
		if (config.defaultBehavior.showSelectionMenu) {
			const items = enabledIgnoreFiles.map(file => ({
				label: file.name,
				description: file.path,
				detail: file.description,
				file: file
			}));
			
			const options = {
				placeHolder: 'Select ignore files to add to',
				canPickMany: config.defaultBehavior.allowMultipleSelection
			};
			
			const selected = await vscode.window.showQuickPick(items, options);
			
			if (!selected || selected.length === 0) {
				return; // User cancelled
			}
			
			selectedFiles = selected.map(item => item.file);
		} else {
			// Use all enabled files
			selectedFiles = enabledIgnoreFiles;
		}
		
		// Show confirmation if configured to do so
		if (config.defaultBehavior.showConfirmation) {
			const fileNames = selectedFiles.map(file => file.name).join(', ');
			const confirm = await vscode.window.showInformationMessage(
				`Add ${resourceUri.fsPath} to ${fileNames}?`,
				{ modal: true },
				'Yes', 'No'
			);
			
			if (confirm !== 'Yes') {
				return; // User cancelled
			}
		}
		
		// Add to ignore files
		await ignoreHandler.addToIgnoreFiles(resourceUri.fsPath, selectedFiles);
	} catch (error) {
		vscode.window.showErrorMessage(`Error: ${error.message}`);
	}
}

module.exports = addToIgnore;