const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function updateSettings() {
	try {
		// Create .vscode directory if it doesn't exist
		const vscodeDir = path.join(vscode.workspace.rootPath, '.vscode');
		if (!fs.existsSync(vscodeDir)) {
			fs.mkdirSync(vscodeDir, { recursive: true });
		}
		
		// Create or update settings.json
		const settingsPath = path.join(vscodeDir, 'settings.json');
		let settings = {};
		
		if (fs.existsSync(settingsPath)) {
			const settingsContent = fs.readFileSync(settingsPath, 'utf8');
			settings = JSON.parse(settingsContent);
		}
		
		// Add our extension settings
		settings['ai-ignore-helper.enabled'] = true;
		
		// Write back to file
		fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
		
		return true;
	} catch (error) {
		vscode.window.showErrorMessage(`Error updating VSCode settings: ${error.message}`);
		return false;
	}
}

module.exports = {
	updateSettings
};