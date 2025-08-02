const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function createIgnoreFile(filePath) {
	try {
		const fullPath = path.join(vscode.workspace.rootPath, filePath);
		const dirName = path.dirname(fullPath);
		
		// Create directory if it doesn't exist
		if (!fs.existsSync(dirName)) {
			fs.mkdirSync(dirName, { recursive: true });
		}
		
		// Create file if it doesn't exist
		if (!fs.existsSync(fullPath)) {
			fs.writeFileSync(fullPath, '');
		}
		
		return true;
	} catch (error) {
		vscode.window.showErrorMessage(`Error creating ignore file: ${error.message}`);
		return false;
	}
}

module.exports = {
	createIgnoreFile
};