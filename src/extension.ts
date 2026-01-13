/**
 * extension.ts
 * Main entry point for AI Ignore Helper extension
 * @module extension
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

// Commands
import { jl_activate } from './commands/activate';
import { jl_addToIgnore } from './commands/add_to_ignore';
import { jl_openConfig } from './commands/open_config';
import { jl_addRule } from './commands/add_rule';
import { jl_removeRule } from './commands/remove_rule';
import { jl_initializeSync, jl_syncFromJSON, jl_syncToJSON } from './commands/settings_sync';
import { jl_addEntry, jl_editEntry, jl_deleteEntry } from './commands/crud_commands';

// Controllers
import { jl_toggleAdding } from './controllers/toggle_adding';

// Providers
import { IgnoreTreeDataProvider } from './providers/IgnoreTreeDataProvider';

// Types
import { IgnoreItem } from './types';

/**
 * Ensures the storage directory exists
 * @param storageUri - The storage URI to ensure exists
 */
async function jl_ensureStorageDirectory(storageUri: vscode.Uri): Promise<void> {
    try {
        await fs.mkdir(storageUri.fsPath, { recursive: true });
    } catch (error) {
        console.error('Error creating storage directory:', error);
    }
}

/**
 * Activates the extension
 * @param context - Extension context
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    console.log('AI Ignore Helper is now active!');

    // Initialize settings synchronization using globalStorageUri
    // This prevents workspace pollution by storing config in VS Code's extension storage
    const storageUri = context.globalStorageUri;
    await jl_ensureStorageDirectory(storageUri);
    const configPath = path.join(storageUri.fsPath, 'ignore-files-config.json');
    const syncDisposable = await jl_initializeSync(configPath);
    if (syncDisposable) {
        context.subscriptions.push(syncDisposable);
    }

    // Create TreeDataProvider for sidebar panel
    const ignoreTreeDataProvider = new IgnoreTreeDataProvider();

    // Register TreeView
    const treeView = vscode.window.createTreeView('ai-ignore-view', {
        treeDataProvider: ignoreTreeDataProvider,
        showCollapseAll: false
    });
    context.subscriptions.push(treeView);

    // Register commands
    const activateCommandDisposable = vscode.commands.registerCommand(
        'ai-ignore.activate',
        jl_activate
    );

    const addToIgnoreCommandDisposable = vscode.commands.registerCommand(
        'ai-ignore.addToIgnore',
        jl_addToIgnore
    );

    const openConfigCommandDisposable = vscode.commands.registerCommand(
        'ai-ignore.openConfig',
        () => jl_openConfig(configPath)
    );

    const addRuleDisposable = vscode.commands.registerCommand(
        'ai-ignore.addRule',
        jl_addRule
    );

    const removeRuleDisposable = vscode.commands.registerCommand(
        'ai-ignore.removeRule',
        jl_removeRule
    );

    // Register sync commands (using globalStorageUri)
    const syncFromJSONDisposable = vscode.commands.registerCommand(
        'ai-ignore.syncFromJSON',
        async () => {
            const syncConfigPath = path.join(context.globalStorageUri.fsPath, 'ignore-files-config.json');
            await jl_syncFromJSON(syncConfigPath);
        }
    );

    const syncToJSONDisposable = vscode.commands.registerCommand(
        'ai-ignore.syncToJSON',
        async () => {
            const syncConfigPath = path.join(context.globalStorageUri.fsPath, 'ignore-files-config.json');
            await jl_syncToJSON(syncConfigPath);
        }
    );

    // Register CRUD commands for sidebar panel
    const addEntryDisposable = vscode.commands.registerCommand(
        'ai-ignore.addEntry',
        jl_addEntry
    );

    const editEntryDisposable = vscode.commands.registerCommand(
        'ai-ignore.editEntry',
        (item: IgnoreItem) => jl_editEntry(item)
    );

    const deleteEntryDisposable = vscode.commands.registerCommand(
        'ai-ignore.deleteEntry',
        (item: IgnoreItem) => jl_deleteEntry(item)
    );

    const refreshViewDisposable = vscode.commands.registerCommand(
        'ai-ignore.refreshView',
        () => ignoreTreeDataProvider.refresh()
    );

    // Register context menu toggle
    jl_toggleAdding(context);

    // Add disposables to context
    context.subscriptions.push(
        activateCommandDisposable,
        addToIgnoreCommandDisposable,
        openConfigCommandDisposable,
        addRuleDisposable,
        removeRuleDisposable,
        syncFromJSONDisposable,
        syncToJSONDisposable,
        addEntryDisposable,
        editEntryDisposable,
        deleteEntryDisposable,
        refreshViewDisposable
    );
}

/**
 * Deactivates the extension
 */
export function deactivate(): void {
    console.log('AI Ignore Helper is now deactivated');
}
