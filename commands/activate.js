const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const configManager = require('./config_manager');
const fileCreator = require('./file_creator');
const writeSettings = require('../controllers/write-settings');

async function activate() {
	try {
		// Create config directory if it doesn't exist
		const configDir = path.join(vscode.workspace.rootPath, 'config');
		if (!fs.existsSync(configDir)) {
			fs.mkdirSync(configDir, { recursive: true });
		}

		// Create config file if it doesn't exist
		const configPath = path.join(configDir, 'ignore-files-config.json');
		if (!fs.existsSync(configPath)) {
			const defaultConfig = {
				ignoreFiles: [
					{
						name: "Trae Ignore",
						path: ".trae/.ignore",
						description: "Archivo ignore para Trae AI",
						createIfNotExists: true,
						enabled: true
					},
					{
						name: "Docker Ignore",
						path: ".dockerignore",
						description: "Archivo ignore para Docker",
						createIfNotExists: true,
						enabled: true
					},
					{
						name: "NPM Ignore",
						path: ".npmignore",
						description: "Archivo ignore para NPM",
						createIfNotExists: true,
						enabled: true
					}
				],
				defaultBehavior: {
					showSelectionMenu: true,
					allowMultipleSelection: true,
					createDirectories: true,
					showConfirmation: true
				}
			};
			
			fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
		}

		// Load configuration
		const config = configManager.loadConfig();

		// Create ignore files if they don't exist
		for (const ignoreFile of config.ignoreFiles) {
			if (ignoreFile.enabled && ignoreFile.createIfNotExists) {
				await fileCreator.createIgnoreFile(ignoreFile.path);
			}
		}

		// Write VSCode settings
		await writeSettings.updateSettings();

		vscode.window.showInformationMessage('AI Ignore Helper activated successfully!');
	} catch (error) {
		vscode.window.showErrorMessage(`Error activating AI Ignore Helper: ${error.message}`);
	}
}

module.exports = activate;