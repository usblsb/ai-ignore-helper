/**
 * config_manager.ts
 * Module for loading and saving extension configuration
 * @module commands/config_manager
 */

import * as vscode from 'vscode';
import { ExtensionConfig, IgnoreFileConfig } from '../types';
import { jl_getVSCodeConfig } from './settings_sync';

/**
 * Loads configuration from VS Code Settings (main source)
 * @returns Loaded configuration or null on error
 */
export function jl_loadConfig(): ExtensionConfig | null {
    try {
        // Get configuration from VS Code Settings
        const config = jl_getVSCodeConfig();

        // Verify configuration has valid data
        if (!config || !config.ignoreFiles || !Array.isArray(config.ignoreFiles)) {
            throw new Error('Invalid configuration. Please check your settings or activate the extension.');
        }

        return config;
    } catch (error) {
        // Show error to user and return null
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error loading configuration: ${errorMessage}`);
        return null;
    }
}

/**
 * Saves configuration to VS Code Settings (main method)
 * @param config - Configuration to save
 * @returns true if saved successfully, false on error
 */
export async function jl_saveConfig(config: ExtensionConfig): Promise<boolean> {
    try {
        const vsConfig = vscode.workspace.getConfiguration('ai-ignore');

        // Force Global to avoid workspace pollution
        const target = vscode.ConfigurationTarget.Global;

        // Update ignore files
        await vsConfig.update('ignoreFiles', config.ignoreFiles, target);

        // Update default behavior if it exists
        if (config.defaultBehavior) {
            await vsConfig.update('showSelectionMenu', config.defaultBehavior.showSelectionMenu, target);
            await vsConfig.update('allowMultipleSelection', config.defaultBehavior.allowMultipleSelection, target);
            await vsConfig.update('createDirectories', config.defaultBehavior.createDirectories, target);
            await vsConfig.update('showConfirmation', config.defaultBehavior.showConfirmation, target);
        }

        return true;
    } catch (error) {
        // Show error to user and return false
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error saving configuration: ${errorMessage}`);
        return false;
    }
}

/**
 * Adds a new ignore file configuration
 * @param ignoreFile - The ignore file configuration to add
 * @returns true if added successfully
 */
export async function jl_addIgnoreFile(ignoreFile: IgnoreFileConfig): Promise<boolean> {
    const config = jl_loadConfig();
    if (!config) {
        return false;
    }

    // Check if already exists
    const exists = config.ignoreFiles.some(f => f.path === ignoreFile.path);
    if (exists) {
        vscode.window.showWarningMessage(`Ignore file with path "${ignoreFile.path}" already exists.`);
        return false;
    }

    config.ignoreFiles.push(ignoreFile);
    return jl_saveConfig(config);
}

/**
 * Updates an existing ignore file configuration
 * @param oldPath - The current path of the ignore file
 * @param newConfig - The new configuration
 * @returns true if updated successfully
 */
export async function jl_updateIgnoreFile(oldPath: string, newConfig: IgnoreFileConfig): Promise<boolean> {
    const config = jl_loadConfig();
    if (!config) {
        return false;
    }

    const index = config.ignoreFiles.findIndex(f => f.path === oldPath);
    if (index === -1) {
        vscode.window.showErrorMessage(`Ignore file with path "${oldPath}" not found.`);
        return false;
    }

    config.ignoreFiles[index] = newConfig;
    return jl_saveConfig(config);
}

/**
 * Removes an ignore file configuration
 * @param path - The path of the ignore file to remove
 * @returns true if removed successfully
 */
export async function jl_removeIgnoreFile(path: string): Promise<boolean> {
    const config = jl_loadConfig();
    if (!config) {
        return false;
    }

    const index = config.ignoreFiles.findIndex(f => f.path === path);
    if (index === -1) {
        vscode.window.showErrorMessage(`Ignore file with path "${path}" not found.`);
        return false;
    }

    config.ignoreFiles.splice(index, 1);
    return jl_saveConfig(config);
}
