const vscode = require('vscode');
const activateCommand = require('./commands/activate');
const addToIgnoreCommand = require('./commands/add_to_gitignore');
const toggleAdding = require('./controllers/toggle-adding');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('AI Ignore Helper is now active!');

	// Register commands
	const activateCommandDisposable = vscode.commands.registerCommand('ai-ignore.activate', activateCommand);
	const addToIgnoreCommandDisposable = vscode.commands.registerCommand('ai-ignore.addToIgnore', addToIgnoreCommand);

	// Register context menu toggle
	toggleAdding(context);

	// Add disposables to context
	context.subscriptions.push(activateCommandDisposable, addToIgnoreCommandDisposable);
}

function deactivate() {
	console.log('AI Ignore Helper is now deactivated');
}

module.exports = {
	activate,
	deactivate
}