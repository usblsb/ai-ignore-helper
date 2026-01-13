/**
 * add_to_ignore.ts
 * Main command for adding files/folders to ignore files
 * @module commands/add_to_ignore
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { jl_loadConfig } from './config_manager';
import { IgnoreFileConfig } from '../types';

/**
 * Represents a resource that can be added to ignore files
 */
interface NormalizedResource {
    fsPath: string;
}

/**
 * SCM Resource State with resourceUri
 */
interface SCMResourceState {
    resourceUri?: vscode.Uri;
}

/**
 * Result item for ignore operations
 */
interface ResultItem {
    file: string;
    path: string;
    reason?: string;
}

/**
 * QuickPick item for ignore file selection
 */
interface IgnoreFilePickItem extends vscode.QuickPickItem {
    file: IgnoreFileConfig;
}

/**
 * Normalizes a resource to get a valid Uri.
 * Handles both file explorer resources (Uri) and SCM resources (SourceControlResourceState).
 * @param resource - The resource to normalize
 * @returns The normalized Uri or null if invalid
 */
function jl_normalizeResource(resource: vscode.Uri | SCMResourceState | null): vscode.Uri | null {
    if (!resource) {
        return null;
    }

    // If it's a SourceControlResourceState from SCM, it has a resourceUri property
    if ('resourceUri' in resource && resource.resourceUri?.fsPath) {
        return resource.resourceUri;
    }

    // If it's a direct Uri from file explorer
    if ('fsPath' in resource && resource.fsPath) {
        return resource as vscode.Uri;
    }

    return null;
}

/**
 * Main command to add selected files/folders to ignore files
 * @param contextSelection - The file that was right-clicked
 * @param allSelections - Array with all selected files
 */
export async function jl_addToIgnore(
    contextSelection: vscode.Uri | SCMResourceState | null,
    allSelections?: (vscode.Uri | SCMResourceState)[]
): Promise<void> {
    try {
        // Handle parameters according to how VS Code passes them:
        // - contextSelection: the file that was right-clicked
        // - allSelections: array with all selected files
        // - Resources can come from explorer (Uri) or SCM (SourceControlResourceState)
        let resources: vscode.Uri[] = [];

        if (allSelections && Array.isArray(allSelections) && allSelections.length > 0) {
            // Use all selected files and normalize resources
            resources = allSelections
                .map(jl_normalizeResource)
                .filter((r): r is vscode.Uri => r !== null);
        } else if (contextSelection) {
            // Use only the right-clicked file
            const normalizedResource = jl_normalizeResource(contextSelection);
            if (normalizedResource) {
                resources = [normalizedResource];
            }
        }

        if (resources.length === 0) {
            vscode.window.showErrorMessage('No resource selected');
            return;
        }

        // Load configuration
        const config = jl_loadConfig();
        if (!config) {
            return;
        }

        // Filter enabled ignore files
        const enabledIgnoreFiles = config.ignoreFiles.filter(file => file.enabled);

        if (enabledIgnoreFiles.length === 0) {
            vscode.window.showInformationMessage('No ignore files are enabled in the configuration');
            return;
        }

        let selectedFiles: IgnoreFileConfig[] = [];

        // Show selection menu if configured
        if (config.defaultBehavior.showSelectionMenu) {
            const items: IgnoreFilePickItem[] = enabledIgnoreFiles.map(file => ({
                label: file.name,
                description: file.path,
                detail: file.description,
                file: file
            }));

            const options: vscode.QuickPickOptions & { canPickMany: boolean } = {
                placeHolder: 'Select ignore files to add to',
                canPickMany: config.defaultBehavior.allowMultipleSelection
            };

            const selected = await vscode.window.showQuickPick(items, options);

            if (!selected) {
                return; // User cancelled
            }

            // Handle both single and multiple selection
            if (Array.isArray(selected)) {
                selectedFiles = selected.map(item => item.file);
            } else {
                selectedFiles = [selected.file];
            }
        } else {
            // Use all enabled files
            selectedFiles = enabledIgnoreFiles;
        }

        // Show confirmation if configured
        if (config.defaultBehavior.showConfirmation) {
            const resourceNames = resources.map(r => path.basename(r.fsPath)).join(', ');
            const fileNames = selectedFiles.map(file => file.name).join(', ');
            const confirm = await vscode.window.showInformationMessage(
                `Add ${resourceNames} to ${fileNames}?`,
                { modal: true },
                'Yes', 'No'
            );

            if (confirm !== 'Yes') {
                return; // User cancelled
            }
        }

        // Process each ignore file
        const allResults: {
            added: ResultItem[];
            skipped: ResultItem[];
            errors: ResultItem[];
        } = {
            added: [],
            skipped: [],
            errors: []
        };

        const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceRoot) {
            vscode.window.showErrorMessage('No workspace folder found');
            return;
        }

        // Process each ignore file separately
        for (const ignoreFile of selectedFiles) {
            try {
                const ignoreFilePath = path.join(workspaceRoot, ignoreFile.path);

                // Check if file exists, if not, create it
                let fileExists = false;
                try {
                    await fs.access(ignoreFilePath);
                    fileExists = true;
                } catch {
                    // File doesn't exist
                    if (ignoreFile.createIfNotExists) {
                        // Create directories if needed
                        const dirPath = path.dirname(ignoreFilePath);
                        await fs.mkdir(dirPath, { recursive: true });

                        // Create empty ignore file
                        await fs.writeFile(ignoreFilePath, '');
                        fileExists = true;
                        vscode.window.showInformationMessage(`Created ignore file: ${ignoreFile.path}`);
                    } else {
                        allResults.errors.push({
                            file: ignoreFile.name,
                            path: 'Multiple files',
                            reason: `Ignore file does not exist and is not configured to be created: ${ignoreFile.path}`
                        });
                        continue;
                    }
                }

                // Read current content of ignore file
                const content = await fs.readFile(ignoreFilePath, 'utf8');
                const originalLines = content.split(/\r?\n/);

                // Create a set with existing paths for more efficient search
                const existingPaths = new Set<string>();
                originalLines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine) {
                        existingPaths.add(trimmedLine);
                    }
                });

                // Process each resource individually
                for (const resource of resources) {
                    try {
                        // Verify resource is valid
                        if (!resource || !resource.fsPath) {
                            allResults.errors.push({
                                file: ignoreFile.name,
                                path: 'Invalid resource',
                                reason: 'Resource is invalid or has no path'
                            });
                            continue;
                        }

                        const relativePath = path.relative(workspaceRoot, resource.fsPath).replace(/\\/g, '/');

                        // Check if file is already in ignore using the set
                        if (existingPaths.has(relativePath)) {
                            allResults.skipped.push({
                                file: ignoreFile.name,
                                path: relativePath
                            });
                        } else {
                            // Add to set to avoid duplicates in this same operation
                            existingPaths.add(relativePath);
                            allResults.added.push({
                                file: ignoreFile.name,
                                path: relativePath
                            });
                        }
                    } catch (resourceError) {
                        const errorMessage = resourceError instanceof Error ? resourceError.message : String(resourceError);
                        allResults.errors.push({
                            file: ignoreFile.name,
                            path: resource?.fsPath || 'Unknown',
                            reason: `Error processing resource: ${errorMessage}`
                        });
                    }
                }

                // Rebuild file with all lines (existing + new)
                const updatedLines: string[] = [];
                const processedPaths = new Set<string>();

                // Add existing lines (maintaining order)
                originalLines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine && existingPaths.has(trimmedLine) && !processedPaths.has(trimmedLine)) {
                        updatedLines.push(line);
                        processedPaths.add(trimmedLine);
                    } else if (!trimmedLine) {
                        // Keep empty lines
                        updatedLines.push(line);
                    }
                });

                // Add new paths (those in existingPaths but not processed)
                existingPaths.forEach(pathItem => {
                    if (!processedPaths.has(pathItem)) {
                        updatedLines.push(pathItem);
                    }
                });

                // Write updated content to ignore file
                await fs.writeFile(ignoreFilePath, updatedLines.join('\n'));

                // Show information about added files
                const addedCount = allResults.added.filter(item => item.file === ignoreFile.name).length;
                if (addedCount > 0) {
                    vscode.window.showInformationMessage(`Added ${addedCount} entries to ${ignoreFile.name}`);
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                allResults.errors.push({
                    file: ignoreFile.name,
                    path: 'Multiple files',
                    reason: `Error processing ignore file: ${errorMessage}`
                });
            }
        }

        // Show summary
        let message = '';

        if (allResults.added.length > 0) {
            message += `Successfully added ${allResults.added.length} entries to ignore files.\n`;
        }

        if (allResults.skipped.length > 0) {
            message += `Skipped ${allResults.skipped.length} entries (already present).\n`;
        }

        if (allResults.errors.length > 0) {
            message += `Encountered ${allResults.errors.length} errors.\n`;
        }

        if (message) {
            // Show message with option to view details
            const selection = await vscode.window.showInformationMessage(message, 'View Details');
            if (selection === 'View Details') {
                // Create a document with details
                const details: string[] = [];

                if (allResults.added.length > 0) {
                    details.push('Added entries:');
                    allResults.added.forEach(item => {
                        details.push(`  - ${item.path} to ${item.file}`);
                    });
                }

                if (allResults.skipped.length > 0) {
                    details.push('Skipped entries (already present):');
                    allResults.skipped.forEach(item => {
                        details.push(`  - ${item.path} in ${item.file}`);
                    });
                }

                if (allResults.errors.length > 0) {
                    details.push('Errors:');
                    allResults.errors.forEach(item => {
                        details.push(`  - ${item.file}: ${item.reason}`);
                    });
                }

                // Show in a new document
                const doc = await vscode.workspace.openTextDocument({ content: details.join('\n'), language: 'plaintext' });
                await vscode.window.showTextDocument(doc);
            }
        } else {
            vscode.window.showInformationMessage('No changes made.');
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error: ${errorMessage}`);
    }
}
