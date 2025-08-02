const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function addToIgnoreFiles(resourcePath, ignoreFiles) {
	try {
		const workspacePath = vscode.workspace.rootPath;
		const relativePath = path.relative(workspacePath, resourcePath);
		
		for (const ignoreFile of ignoreFiles) {
			const ignoreFilePath = path.join(workspacePath, ignoreFile.path);
			
			if (!fs.existsSync(ignoreFilePath)) {
				vscode.window.showWarningMessage(`Ignore file not found: ${ignoreFile.path}`);
				continue;
			}
			
			// Read current content
			let content = fs.readFileSync(ignoreFilePath, 'utf8');
			
			// Normalize line endings
			content = content.replace(/\r\n/g, '\n');
			
			// Split into lines
			const lines = content.split('\n');
			
			// Check if file is already ignored
			if (lines.includes(relativePath)) {
				vscode.window.showInformationMessage(`${relativePath} is already in ${ignoreFile.name}`);
				continue;
			}
			
			// Add the new line
			lines.push(relativePath);
			
			// Write back to file
			fs.writeFileSync(ignoreFilePath, lines.join('\n'));
			
			vscode.window.showInformationMessage(`Added ${relativePath} to ${ignoreFile.name}`);
		}
		
		return true;
	} catch (error) {
		vscode.window.showErrorMessage(`Error adding to ignore files: ${error.message}`);
		return false;
	}
}

module.exports = {
	addToIgnoreFiles
};