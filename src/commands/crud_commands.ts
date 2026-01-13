/**
 * crud_commands.ts
 * CRUD operations for managing ignore templates from the sidebar panel
 * @module commands/crud_commands
 */

import * as vscode from 'vscode';
import { IgnoreItem, IgnoreFileConfig, ExtensionConfig } from '../types';
import { jl_getVSCodeConfig } from './settings_sync';
import { jl_saveConfig, jl_addIgnoreFile, jl_updateIgnoreFile, jl_removeIgnoreFile } from './config_manager';
import { jl_saveProjectTemplate, jl_removeProjectTemplate } from '../providers/IgnoreTreeDataProvider';

/**
 * Adds a new ignore template entry
 * Shows input dialogs for name, path, description, enabled status, and destination
 */
export async function jl_addEntry(): Promise<void> {
    try {
        // Request name from user
        const name = await vscode.window.showInputBox({
            prompt: 'Template name',
            placeHolder: 'Ex: My Custom Ignore',
            ignoreFocusOut: true,
            validateInput: (v) => (v && v.trim().length > 0 ? null : 'Name is required')
        });
        if (!name) { return; }

        // Request path from user
        const path = await vscode.window.showInputBox({
            prompt: 'Ignore file path (relative to workspace)',
            placeHolder: 'Ex: .myignore or .folder/.ignore',
            ignoreFocusOut: true,
            validateInput: (v) => (v && v.trim().length > 0 ? null : 'Path is required')
        });
        if (!path) { return; }

        // Request description from user
        const description = await vscode.window.showInputBox({
            prompt: 'Description (optional)',
            placeHolder: 'Ex: Ignore file for my custom tool',
            ignoreFocusOut: true
        });

        // Request enabled status
        const enabledPick = await vscode.window.showQuickPick(
            [
                { label: 'Enabled', value: true, description: 'Template will be active' },
                { label: 'Disabled', value: false, description: 'Template will be inactive' }
            ],
            {
                placeHolder: 'Enable this template?'
            }
        );
        if (!enabledPick) { return; }

        // Request destination (global or project)
        const destinationPick = await vscode.window.showQuickPick(
            [
                {
                    label: '$(globe) Global Template',
                    value: 'global' as const,
                    description: 'Available in all projects, synced with Settings Sync'
                },
                {
                    label: '$(folder) Project Template',
                    value: 'project' as const,
                    description: 'Saved in ai-ignore-templates.json in workspace root'
                }
            ],
            {
                placeHolder: 'Where to save this template?'
            }
        );
        if (!destinationPick) { return; }

        // Create new ignore file config
        const newConfig: IgnoreFileConfig = {
            name,
            path,
            description: description || '',
            createIfNotExists: true,
            enabled: enabledPick.value,
            source: destinationPick.value
        };

        let success: boolean;
        if (destinationPick.value === 'project') {
            success = await jl_saveProjectTemplate(newConfig);
        } else {
            success = await jl_addIgnoreFile(newConfig);
        }

        if (success) {
            vscode.window.showInformationMessage(`Added ${destinationPick.value} template: ${name}`);
            // Force refresh of the tree view to show new template immediately
            await vscode.commands.executeCommand('ai-ignore.refreshView');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error adding template: ${errorMessage}`);
    }
}

/**
 * Edits an existing ignore template entry
 * @param item - The IgnoreItem to edit (from TreeView selection)
 */
export async function jl_editEntry(item?: IgnoreItem): Promise<void> {
    try {
        let configToEdit: IgnoreFileConfig;

        if (item) {
            // Use the selected item from TreeView
            configToEdit = item.config;
        } else {
            // Show picker to select which template to edit
            const config = jl_getVSCodeConfig();
            const items = config.ignoreFiles.map(f => ({
                label: f.name,
                description: f.path,
                detail: f.description,
                config: f
            }));

            const picked = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select template to edit'
            });
            if (!picked) { return; }
            configToEdit = picked.config;
        }

        const oldPath = configToEdit.path;

        // Request new name
        const name = await vscode.window.showInputBox({
            prompt: 'Template name',
            value: configToEdit.name,
            ignoreFocusOut: true,
            validateInput: (v) => (v && v.trim().length > 0 ? null : 'Name is required')
        });
        if (!name) { return; }

        // Request new path
        const path = await vscode.window.showInputBox({
            prompt: 'Ignore file path',
            value: configToEdit.path,
            ignoreFocusOut: true,
            validateInput: (v) => (v && v.trim().length > 0 ? null : 'Path is required')
        });
        if (!path) { return; }

        // Request new description
        const description = await vscode.window.showInputBox({
            prompt: 'Description',
            value: configToEdit.description,
            ignoreFocusOut: true
        });

        // Request enabled status
        const enabledPick = await vscode.window.showQuickPick(
            [
                { label: 'Enabled', value: true },
                { label: 'Disabled', value: false }
            ],
            {
                placeHolder: 'Enable this template?'
            }
        );
        if (!enabledPick) { return; }

        // Create updated config
        const updatedConfig: IgnoreFileConfig = {
            name,
            path,
            description: description ?? configToEdit.description,
            createIfNotExists: configToEdit.createIfNotExists,
            enabled: enabledPick.value
        };

        const success = await jl_updateIgnoreFile(oldPath, updatedConfig);
        if (success) {
            vscode.window.showInformationMessage(`Updated template: ${name}`);
            // Force refresh of the tree view
            await vscode.commands.executeCommand('ai-ignore.refreshView');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error editing template: ${errorMessage}`);
    }
}

/**
 * Deletes an existing ignore template entry
 * @param item - The IgnoreItem to delete (from TreeView selection)
 */
export async function jl_deleteEntry(item?: IgnoreItem): Promise<void> {
    try {
        let configToDelete: IgnoreFileConfig;

        if (item) {
            // Use the selected item from TreeView
            configToDelete = item.config;
        } else {
            // Show picker to select which template to delete
            const config = jl_getVSCodeConfig();
            const items = config.ignoreFiles.map(f => ({
                label: f.name,
                description: f.path,
                detail: f.description,
                config: f
            }));

            const picked = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select template to delete'
            });
            if (!picked) { return; }
            configToDelete = picked.config;
        }

        // Show confirmation dialog
        const confirm = await vscode.window.showInformationMessage(
            `Are you sure you want to delete "${configToDelete.name}"?`,
            { modal: true },
            'Yes',
            'No'
        );

        if (confirm !== 'Yes') { return; }

        // Delete from appropriate source
        let success: boolean;
        if (configToDelete.source === 'project') {
            success = await jl_removeProjectTemplate(configToDelete.path);
        } else if (configToDelete.source === 'default') {
            vscode.window.showWarningMessage('Default templates cannot be deleted. You can disable them instead.');
            return;
        } else {
            success = await jl_removeIgnoreFile(configToDelete.path);
        }

        if (success) {
            vscode.window.showInformationMessage(`Deleted template: ${configToDelete.name}`);
            // Force refresh of the tree view
            await vscode.commands.executeCommand('ai-ignore.refreshView');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error deleting template: ${errorMessage}`);
    }
}
