/**
 * ignore_handler.ts
 * Helper functions for adding resources to ignore files
 * @module commands/ignore_handler
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { jl_createIgnoreFile } from './file_creator';
import { IgnoreFileConfig } from '../types';

/**
 * Result structure for ignore file operations
 */
export interface IgnoreResult {
    file: string;
    path: string;
    reason?: string;
}

/**
 * Results from adding to ignore files
 */
export interface IgnoreResults {
    added: IgnoreResult[];
    skipped: IgnoreResult[];
    errors: IgnoreResult[];
}

/**
 * Adds a resource to multiple ignore files
 * @param resourcePath - Path of the resource to add
 * @param ignoreFiles - Array of ignore file configurations
 * @returns Results of the operation
 */
export async function jl_addToIgnoreFiles(
    resourcePath: string,
    ignoreFiles: IgnoreFileConfig[]
): Promise<IgnoreResults> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return {
                added: [],
                skipped: [],
                errors: [{ file: 'General', path: resourcePath, reason: 'No workspace folder found' }]
            };
        }

        const workspacePath = workspaceFolder.uri.fsPath;
        const relativePath = path.relative(workspacePath, resourcePath).replace(/\\/g, '/');

        const results: IgnoreResults = {
            added: [],
            skipped: [],
            errors: []
        };

        // Process each ignore file sequentially
        for (const ignoreFile of ignoreFiles) {
            try {
                const ignoreFilePath = path.join(workspacePath, ignoreFile.path);

                // Check if file exists
                if (!fs.existsSync(ignoreFilePath)) {
                    // If configured to be created automatically
                    if (ignoreFile.createIfNotExists) {
                        // Create the ignore file (and directory if needed)
                        const created = await jl_createIgnoreFile(ignoreFile.path);
                        if (!created) {
                            results.errors.push({
                                file: ignoreFile.name,
                                path: relativePath,
                                reason: `Could not create ignore file: ${ignoreFile.path}`
                            });
                            continue;
                        }
                        vscode.window.showInformationMessage(`Created ignore file: ${ignoreFile.path}`);
                    } else {
                        results.errors.push({
                            file: ignoreFile.name,
                            path: relativePath,
                            reason: `Ignore file does not exist and is not configured for automatic creation: ${ignoreFile.path}`
                        });
                        continue;
                    }
                }

                // Read current content with detailed error handling
                let content: string;
                try {
                    content = fs.readFileSync(ignoreFilePath, 'utf8');
                } catch (readError) {
                    const errorMessage = readError instanceof Error ? readError.message : String(readError);
                    results.errors.push({
                        file: ignoreFile.name,
                        path: relativePath,
                        reason: `Error reading file: ${errorMessage}`
                    });
                    continue;
                }

                // Normalize line breaks
                content = content.replace(/\r\n/g, '\n');

                // Split into lines
                const lines = content.split('\n');

                // Check if file is already ignored with improved logic
                const normalizedPath = relativePath;
                let alreadyIgnored = false;

                for (const line of lines) {
                    // Normalize line for comparison
                    const normalizedLine = line.trim().replace(/\\/g, '/');
                    // Compare normalized paths
                    if (normalizedLine === normalizedPath) {
                        alreadyIgnored = true;
                        break;
                    }
                }

                if (alreadyIgnored) {
                    results.skipped.push({
                        file: ignoreFile.name,
                        path: relativePath
                    });
                    continue;
                }

                // Add the new line
                lines.push(relativePath);

                // Write back to file with error handling
                try {
                    fs.writeFileSync(ignoreFilePath, lines.join('\n'));
                } catch (writeError) {
                    const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
                    results.errors.push({
                        file: ignoreFile.name,
                        path: relativePath,
                        reason: `Error writing to file: ${errorMessage}`
                    });
                    continue;
                }

                results.added.push({
                    file: ignoreFile.name,
                    path: relativePath
                });
            } catch (fileError) {
                const errorMessage = fileError instanceof Error ? fileError.message : String(fileError);
                results.errors.push({
                    file: ignoreFile.name,
                    path: relativePath,
                    reason: `Unexpected error: ${errorMessage}`
                });
            }
        }

        return results;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error adding to ignore files: ${errorMessage}`);
        return {
            added: [],
            skipped: [],
            errors: [{
                file: 'General',
                path: resourcePath,
                reason: errorMessage
            }]
        };
    }
}
