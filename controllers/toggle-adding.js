const vscode = require('vscode');

function toggleAdding(context) {
	// This function can be used to add more complex logic for controlling
	// when the context menu item should be shown
	// For now, we're using the simple condition in package.json
	
	// Example of how to set a context value:
	// vscode.commands.executeCommand('setContext', 'aiIgnoreEnabled', true);
}

module.exports = toggleAdding;