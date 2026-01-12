const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const activateCommand = require('./commands/activate');
const addToIgnoreCommand = require('./commands/add_to_gitignore');
const openConfigCommand = require('./commands/open_config');
const toggleAdding = require('./controllers/toggle-adding');
const settingsSync = require('./commands/settings_sync');
const addRule = require('./commands/add_rule');
const removeRule = require('./commands/remove_rule');

/**
 * Ensures the storage directory exists
 * @param {vscode.Uri} storageUri - The storage URI to ensure exists
 */
async function ensureStorageDirectory(storageUri) {
	try {
		await fs.mkdir(storageUri.fsPath, { recursive: true });
	} catch (error) {
		console.error('Error creating storage directory:', error);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
	console.log('AI Ignore Helper is now active!');

	// Initialize settings synchronization using globalStorageUri
	// This prevents workspace pollution by storing config in VS Code's extension storage
	const storageUri = context.globalStorageUri;
	await ensureStorageDirectory(storageUri);
	const configPath = path.join(storageUri.fsPath, 'ignore-files-config.json');
	const syncDisposable = await settingsSync.initializeSync(configPath, storageUri);
	if (syncDisposable) {
		context.subscriptions.push(syncDisposable);
	}

	// Register commands
	const activateCommandDisposable = vscode.commands.registerCommand('ai-ignore.activate', activateCommand);
	const addToIgnoreCommandDisposable = vscode.commands.registerCommand('ai-ignore.addToIgnore', addToIgnoreCommand);
	const openConfigCommandDisposable = vscode.commands.registerCommand('ai-ignore.openConfig', () => openConfigCommand(configPath));
	const addRuleDisposable = vscode.commands.registerCommand('ai-ignore.addRule', addRule);
	const removeRuleDisposable = vscode.commands.registerCommand('ai-ignore.removeRule', removeRule);

	// Register sync commands (using globalStorageUri)
	const syncFromJSONDisposable = vscode.commands.registerCommand('ai-ignore.syncFromJSON', async () => {
		const syncConfigPath = path.join(context.globalStorageUri.fsPath, 'ignore-files-config.json');
		await settingsSync.syncFromJSON(syncConfigPath);
	});

	const syncToJSONDisposable = vscode.commands.registerCommand('ai-ignore.syncToJSON', async () => {
		const syncConfigPath = path.join(context.globalStorageUri.fsPath, 'ignore-files-config.json');
		await settingsSync.syncToJSON(syncConfigPath);
	});

	// Register context menu toggle
	toggleAdding(context);

	// Add disposables to context
	context.subscriptions.push(
		activateCommandDisposable, 
		addToIgnoreCommandDisposable, 
		openConfigCommandDisposable,
		addRuleDisposable,
		removeRuleDisposable,
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