/**
 * settings_sync.ts
 * Module for synchronizing configurations between VS Code Settings and JSON file
 * @module commands/settings_sync
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ExtensionConfig, IgnoreFileConfig, DefaultBehavior } from '../types';

// Flags to prevent synchronization loops between JSON and Settings
let isSyncingFromJSON = false;
let isSyncingToJSON = false;

/**
 * Gets configuration from VS Code Settings
 * @returns Complete configuration object
 */
export function jl_getVSCodeConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration('ai-ignore');

    return {
        ignoreFiles: config.get<IgnoreFileConfig[]>('ignoreFiles', []),
        defaultBehavior: {
            showSelectionMenu: config.get<boolean>('showSelectionMenu', true),
            allowMultipleSelection: config.get<boolean>('allowMultipleSelection', true),
            createDirectories: config.get<boolean>('createDirectories', true),
            showConfirmation: config.get<boolean>('showConfirmation', true)
        }
    };
}

/**
 * Updates VS Code Settings with JSON file configuration
 * @param jsonConfig - Configuration from JSON file
 */
export async function jl_updateVSCodeSettings(jsonConfig: ExtensionConfig): Promise<void> {
    const config = vscode.workspace.getConfiguration('ai-ignore');

    try {
        // Avoid loops: mark that we're updating from JSON
        isSyncingFromJSON = true;
        // Use Global by default to avoid workspace pollution (.vscode/settings.json)
        const target = vscode.ConfigurationTarget.Global;

        // Update ignore files
        await config.update('ignoreFiles', jsonConfig.ignoreFiles, target);

        // Update default behavior
        if (jsonConfig.defaultBehavior) {
            await config.update('showSelectionMenu', jsonConfig.defaultBehavior.showSelectionMenu, target);
            await config.update('allowMultipleSelection', jsonConfig.defaultBehavior.allowMultipleSelection, target);
            await config.update('createDirectories', jsonConfig.defaultBehavior.createDirectories, target);
            await config.update('showConfirmation', jsonConfig.defaultBehavior.showConfirmation, target);
        }

        console.log('VS Code Settings updated successfully in', target === vscode.ConfigurationTarget.Global ? 'User Settings' : 'Workspace Settings');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error updating VS Code Settings:', error);
        vscode.window.showErrorMessage('Error updating configuration: ' + errorMessage);
    } finally {
        isSyncingFromJSON = false;
    }
}

/**
 * Updates JSON file with VS Code Settings configuration
 * @param configPath - Path to the JSON configuration file
 */
export async function jl_updateJSONFromSettings(configPath: string): Promise<void> {
    try {
        // Avoid loops: mark that we're updating JSON from Settings
        isSyncingToJSON = true;
        const vsCodeConfig = jl_getVSCodeConfig();

        // Create directory if it doesn't exist
        const configDir = path.dirname(configPath);
        await fs.mkdir(configDir, { recursive: true });

        // Write JSON file
        await fs.writeFile(configPath, JSON.stringify(vsCodeConfig, null, 2), 'utf8');

        console.log('JSON file updated from VS Code Settings');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error updating JSON file:', error);
        vscode.window.showErrorMessage('Error updating configuration file: ' + errorMessage);
    } finally {
        isSyncingToJSON = false;
    }
}

/**
 * Syncs configuration from JSON file to VS Code Settings
 * @param configPath - Path to the JSON configuration file
 */
export async function jl_syncFromJSON(configPath: string): Promise<void> {
    try {
        const jsonContent = await fs.readFile(configPath, 'utf8');
        const jsonConfig = JSON.parse(jsonContent) as ExtensionConfig;

        await jl_updateVSCodeSettings(jsonConfig);

        vscode.window.showInformationMessage('Configuration synced from JSON file');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error syncing from JSON:', error);
        vscode.window.showErrorMessage('Error reading configuration: ' + errorMessage);
    }
}

/**
 * Syncs configuration from VS Code Settings to JSON file
 * @param configPath - Path to the JSON configuration file
 */
export async function jl_syncToJSON(configPath: string): Promise<void> {
    try {
        await jl_updateJSONFromSettings(configPath);
        vscode.window.showInformationMessage('Configuration synced to JSON file');
    } catch (error) {
        console.error('Error syncing to JSON:', error);
    }
}

/**
 * Sets up listener for configuration changes
 * @param configPath - Path to the JSON configuration file
 * @returns Disposable for the configuration listener
 */
export function jl_setupConfigurationListener(configPath: string): vscode.Disposable {
    console.log('Registering configuration listener for:', configPath);
    return vscode.workspace.onDidChangeConfiguration(async (event) => {
        console.log('Configuration change event detected');
        // Only react to changes in our configuration
        if (event.affectsConfiguration('ai-ignore')) {
            if (isSyncingFromJSON) {
                console.log('Change in Settings originated from JSON sync. Skipping to avoid loop.');
                return;
            }
            console.log('AI Ignore configuration changed, syncing from VS Code Settings to JSON...');
            try {
                await jl_updateJSONFromSettings(configPath);
                console.log('Sync completed successfully');
            } catch (error) {
                console.error('Error during automatic sync:', error);
            }
        } else {
            console.log('Configuration change not related to ai-ignore');
        }
    });
}

/**
 * Initializes bidirectional synchronization
 * @param configPath - Path to the JSON configuration file
 * @returns Disposable for cleanup
 */
export async function jl_initializeSync(configPath: string): Promise<vscode.Disposable | undefined> {
    try {
        // Create watcher for automatic JSON -> Settings sync
        try {
            const configDir = path.dirname(configPath);
            const watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(configDir, 'ignore-files-config.json')
            );

            const handleChange = async (): Promise<void> => {
                try {
                    if (isSyncingToJSON) {
                        console.log('Change in JSON originated from Settings sync. Skipping to avoid loop.');
                        return;
                    }
                    const jsonContent = await fs.readFile(configPath, 'utf8');
                    const jsonConfig = JSON.parse(jsonContent) as ExtensionConfig;
                    await jl_updateVSCodeSettings(jsonConfig);
                    console.log('Automatic JSON -> Settings sync applied');
                } catch (e) {
                    console.error('Error in automatic JSON -> Settings sync:', e);
                }
            };

            watcher.onDidChange(handleChange);
            watcher.onDidCreate(handleChange);
            watcher.onDidDelete(async () => {
                console.log('JSON file deleted, no changes to Settings');
            });
        } catch (watchErr) {
            console.error('Could not create watcher for JSON:', watchErr);
        }

        // Check if JSON file exists and has more configurations than VS Code Settings
        let shouldSyncFromJSON = false;

        try {
            const jsonContent = await fs.readFile(configPath, 'utf8');
            const jsonConfig = JSON.parse(jsonContent) as ExtensionConfig;
            const vsCodeConfig = jl_getVSCodeConfig();

            // If JSON has more ignore files than VS Code Settings, sync from JSON
            if (jsonConfig.ignoreFiles && jsonConfig.ignoreFiles.length > vsCodeConfig.ignoreFiles.length) {
                shouldSyncFromJSON = true;
                console.log(`JSON has ${jsonConfig.ignoreFiles.length} files, VS Code Settings has ${vsCodeConfig.ignoreFiles.length}`);
            }
        } catch (error) {
            console.log('Could not read JSON file or VS Code Settings, using default configuration');
        }

        if (shouldSyncFromJSON) {
            // Sync from JSON to VS Code Settings if JSON has more configurations
            console.log('Initializing sync: JSON -> VS Code Settings');
            await jl_syncFromJSON(configPath);
        } else {
            // Sync from VS Code Settings to JSON (previous behavior)
            console.log('Initializing sync: VS Code Settings -> JSON');
            await jl_updateJSONFromSettings(configPath);
        }

        console.log('Initial sync completed');

        // Set up listener for future changes
        const disposable = jl_setupConfigurationListener(configPath);

        return disposable;
    } catch (error) {
        console.error('Error initializing sync:', error);
        vscode.window.showErrorMessage('Error initializing configuration sync');
        return undefined;
    }
}
