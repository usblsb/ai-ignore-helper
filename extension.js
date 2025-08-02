const vscode = require('vscode');
const path = require('path');
const activateCommand = require('./commands/activate');
const addToIgnoreCommand = require('./commands/add_to_gitignore');
const openConfigCommand = require('./commands/open_config');
const toggleAdding = require('./controllers/toggle-adding');
const settingsSync = require('./commands/settings_sync');

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('AI Ignore Helper is now active!');

	// Initialize settings synchronization
	const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
	if (workspaceRoot) {
		const configPath = path.join(workspaceRoot, 'config', 'ignore-files-config.json');
		const syncDisposable = await settingsSync.initializeSync(configPath);
		if (syncDisposable) {
			context.subscriptions.push(syncDisposable);
		}
	}

	// Register commands
	const activateCommandDisposable = vscode.commands.registerCommand('ai-ignore.activate', activateCommand);
	const addToIgnoreCommandDisposable = vscode.commands.registerCommand('ai-ignore.addToIgnore', addToIgnoreCommand);
	const openConfigCommandDisposable = vscode.commands.registerCommand('ai-ignore.openConfig', openConfigCommand);

	// Register sync commands
	const syncFromJSONDisposable = vscode.commands.registerCommand('ai-ignore.syncFromJSON', async () => {
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'config', 'ignore-files-config.json');
			await settingsSync.syncFromJSON(configPath);
		}
	});

	const syncToJSONDisposable = vscode.commands.registerCommand('ai-ignore.syncToJSON', async () => {
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'config', 'ignore-files-config.json');
			await settingsSync.syncToJSON(configPath);
		}
	});

	// Register context menu toggle
	toggleAdding(context);

	// Add disposables to context
	context.subscriptions.push(
		activateCommandDisposable, 
		addToIgnoreCommandDisposable, 
		openConfigCommandDisposable,
		syncFromJSONDisposable,
		syncToJSONDisposable
	);
}

function deactivate() {
	console.log('AI Ignore Helper is now deactivated');
}

module.exports = {
	activate,
	deactivate
}