/**
 * open_config.ts
 * Command to open the configuration file
 * @module commands/open_config
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Opens the global configuration JSON file
 * @param configPath - Path to the configuration file
 */
export async function jl_openConfig(configPath: string): Promise<void> {
    try {
        if (!configPath) {
            throw new Error('Config path not provided');
        }

        // Check if file exists
        if (!fs.existsSync(configPath)) {
            // The file should have been created by initializeSync in extension.ts
            // but just in case, create the directory if it doesn't exist
            const configDir = path.dirname(configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            // If we get here and file doesn't exist, better not to create an empty one without structure
            vscode.window.showWarningMessage('Configuration file was not found at the expected path.');
            return;
        }

        // Open the configuration file
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error opening configuration file: ${errorMessage}`);
    }
}
