/**
 * activate.ts
 * Command to activate and ensure ignore files exist
 * @module commands/activate
 */

import * as vscode from 'vscode';
import { jl_createIgnoreFile } from './file_creator';
import { IgnoreFileConfig } from '../types';

/**
 * Activates the extension and creates enabled ignore files if they don't exist
 */
export async function jl_activate(): Promise<void> {
    try {
        // Load configuration from VS Code Settings
        const vscodeConfig = vscode.workspace.getConfiguration('ai-ignore');
        const ignoreFiles = vscodeConfig.get<IgnoreFileConfig[]>('ignoreFiles', []);

        // Create ignore files if they don't exist
        for (const ignoreFile of ignoreFiles) {
            if (ignoreFile.enabled && ignoreFile.createIfNotExists) {
                await jl_createIgnoreFile(ignoreFile.path);
            }
        }

        vscode.window.showInformationMessage('AI Ignore Helper: Ignore files checked/created successfully!');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error activating AI Ignore Helper: ${errorMessage}`);
    }
}
