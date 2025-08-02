const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function loadConfig() {
	try {
		const configPath = path.join(vscode.workspace.rootPath, 'config', 'ignore-files-config.json');
		
		if (!fs.existsSync(configPath)) {
			throw new Error('Configuration file not found. Please activate the extension first.');
		}
		
		const configContent = fs.readFileSync(configPath, 'utf8');
		return JSON.parse(configContent);
	} catch (error) {
		vscode.window.showErrorMessage(`Error loading configuration: ${error.message}`);
		return null;
	}
}

function saveConfig(config) {
	try {
		const configPath = path.join(vscode.workspace.rootPath, 'config', 'ignore-files-config.json');
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
		return true;
	} catch (error) {
		vscode.window.showErrorMessage(`Error saving configuration: ${error.message}`);
		return false;
	}
}

module.exports = {
	loadConfig,
	saveConfig
};