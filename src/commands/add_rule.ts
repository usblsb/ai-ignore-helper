/**
 * add_rule.ts
 * Command to add a new ignore rule via input dialogs
 * @module commands/add_rule
 */

import * as vscode from 'vscode';
import { jl_loadConfig, jl_saveConfig } from './config_manager';
import { IgnoreFileConfig } from '../types';

/**
 * Prompts user to add a new ignore rule and saves it to configuration
 */
export async function jl_addRule(): Promise<void> {
    try {
        // Get current configuration from VS Code Settings
        const currentConfig = jl_loadConfig();
        if (!currentConfig) {
            return;
        }

        // Request data from user
        const name = await vscode.window.showInputBox({
            prompt: 'Descriptive name (name)',
            placeHolder: 'Ex: Cursor Ignore',
            ignoreFocusOut: true,
            validateInput: (v) => (v && v.trim().length > 0 ? null : 'Name is required')
        });
        if (!name) { return; }

        const path = await vscode.window.showInputBox({
            prompt: 'Relative path of ignore file (path)',
            placeHolder: 'Ex: .cursorignore or .trae/.ignore',
            ignoreFocusOut: true,
            validateInput: (v) => (v && v.trim().length > 0 ? null : 'Path is required')
        });
        if (!path) { return; }

        const description = await vscode.window.showInputBox({
            prompt: 'Description (description)',
            placeHolder: 'Ex: Ignore file for Cursor',
            ignoreFocusOut: true
        });

        const createIfNotExistsPick = await vscode.window.showQuickPick(['true', 'false'], {
            placeHolder: 'Create file if it doesn\'t exist (createIfNotExists)'
        });
        if (!createIfNotExistsPick) { return; }

        const enabledPick = await vscode.window.showQuickPick(['true', 'false'], {
            placeHolder: 'Enable this ignore file (enabled)'
        });
        if (!enabledPick) { return; }

        const createIfNotExists = createIfNotExistsPick === 'true';
        const enabled = enabledPick === 'true';

        // Avoid duplicates by path
        const exists = currentConfig.ignoreFiles.some((f) => f.path === path);
        if (exists) {
            vscode.window.showWarningMessage(`A rule with path already exists: ${path}`);
            return;
        }

        const newRule: IgnoreFileConfig = {
            name,
            path,
            description: description || '',
            createIfNotExists,
            enabled
        };

        const newConfig = {
            ...currentConfig,
            ignoreFiles: [...currentConfig.ignoreFiles, newRule]
        };

        const ok = await jl_saveConfig(newConfig);
        if (ok) {
            vscode.window.showInformationMessage('Rule added successfully.');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error adding rule: ${errorMessage}`);
    }
}
