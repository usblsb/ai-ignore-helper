/**
 * file_creator.ts
 * Module for creating ignore files and directories
 * @module commands/file_creator
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Creates an ignore file and its directory structure if they don't exist
 * @param filePath - Relative path of the ignore file to create
 * @returns true if created successfully, false on error
 */
export async function jl_createIgnoreFile(filePath: string): Promise<boolean> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder found');
            return false;
        }

        // Build the full path of the ignore file
        const fullPath = path.join(workspaceFolder.uri.fsPath, filePath);
        const dirName = path.dirname(fullPath);

        // Create all necessary directory structure if it doesn't exist
        // The 'recursive: true' flag creates all parent directories needed
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        // Create empty ignore file if it doesn't exist
        // This allows the user to start with a clean file
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, '');
        }

        return true;
    } catch (error) {
        // Show error to user and return false to indicate failure
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error creating ignore file: ${errorMessage}`);
        return false;
    }
}
