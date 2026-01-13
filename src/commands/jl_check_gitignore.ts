/**
 * jl_check_gitignore.ts
 * Command to check for inconsistencies between .gitignore and tracked files.
 * Detects files that are in .gitignore but still tracked by Git.
 * @module commands/jl_check_gitignore
 */

import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Represents a file that is tracked but should be ignored
 */
interface TrackedIgnoredFile {
    path: string;
    label: string;
}

/**
 * Executes a git command in the workspace
 * @param workspacePath - Path to the workspace root
 * @param command - Git command to execute
 * @returns Promise with stdout output
 */
async function jl_execGitCommand(workspacePath: string, command: string): Promise<string> {
    try {
        const { stdout } = await execAsync(command, { cwd: workspacePath });
        return stdout.trim();
    } catch (error) {
        // Command may fail if no files match, return empty string
        return '';
    }
}

/**
 * Gets all tracked files that should be ignored according to .gitignore
 * @param workspacePath - Path to the workspace root
 * @returns Promise with array of problematic files
 */
async function jl_getTrackedIgnoredFiles(workspacePath: string): Promise<TrackedIgnoredFile[]> {
    const problems: TrackedIgnoredFile[] = [];

    // Get all tracked files
    const trackedFiles = await jl_execGitCommand(workspacePath, 'git ls-files --cached');

    if (!trackedFiles) {
        return problems;
    }

    const files = trackedFiles.split('\n').filter(f => f.length > 0);

    // Check each file against .gitignore using git check-ignore
    for (const file of files) {
        try {
            // git check-ignore returns 0 if file is ignored, 1 if not
            const result = await jl_execGitCommand(
                workspacePath,
                `git check-ignore -q "${file}" && echo "ignored" || echo "not-ignored"`
            );

            if (result === 'ignored') {
                problems.push({
                    path: file,
                    label: `$(file) ${file}`
                });
            }
        } catch {
            // Ignore errors for individual files
        }
    }

    return problems;
}

/**
 * Removes files from Git tracking (keeps local copies)
 * @param workspacePath - Path to the workspace root
 * @param files - Array of file paths to untrack
 * @returns Promise with success status
 */
async function jl_untrackFiles(workspacePath: string, files: string[]): Promise<boolean> {
    try {
        for (const file of files) {
            await jl_execGitCommand(workspacePath, `git rm --cached "${file}"`);
        }
        return true;
    } catch (error) {
        console.error('Error untracking files:', error);
        return false;
    }
}

/**
 * Main command handler: Checks for .gitignore sync issues
 * Shows problems and offers to fix them automatically
 */
export async function jl_checkGitignoreSync(): Promise<void> {
    // Get workspace folder
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('No hay un workspace abierto.');
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;

    // Show progress indicator
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Verificando sincronización de .gitignore...',
        cancellable: false
    }, async () => {
        // Check if this is a git repository
        const gitCheck = await jl_execGitCommand(workspacePath, 'git rev-parse --git-dir');

        if (!gitCheck) {
            vscode.window.showWarningMessage('Este directorio no es un repositorio Git.');
            return;
        }

        // Get problematic files
        const problems = await jl_getTrackedIgnoredFiles(workspacePath);

        if (problems.length === 0) {
            vscode.window.showInformationMessage(
                '✅ No hay incoherencias. Todos los archivos en .gitignore están correctamente sin rastrear.'
            );
            return;
        }

        // Show QuickPick with options
        const items: vscode.QuickPickItem[] = [
            {
                label: '$(tools) Corregir todo automáticamente',
                description: `Ejecutar 'git rm --cached' para ${problems.length} archivo(s)`,
                detail: 'Los archivos locales NO se eliminarán'
            },
            {
                label: '$(clippy) Copiar comandos al portapapeles',
                description: 'Copiar los comandos git rm --cached'
            },
            {
                label: '$(list-unordered) Ver archivos problemáticos',
                description: `${problems.length} archivo(s) encontrado(s)`
            }
        ];

        const selection = await vscode.window.showQuickPick(items, {
            title: `⚠️ ${problems.length} archivo(s) en .gitignore siguen siendo rastreados`,
            placeHolder: 'Selecciona una acción'
        });

        if (!selection) {
            return;
        }

        if (selection.label.includes('Corregir todo')) {
            // Fix automatically
            const confirm = await vscode.window.showWarningMessage(
                `¿Deseas eliminar ${problems.length} archivo(s) del seguimiento de Git? Los archivos locales NO se eliminarán.`,
                { modal: true },
                'Sí, corregir'
            );

            if (confirm === 'Sí, corregir') {
                const success = await jl_untrackFiles(workspacePath, problems.map(p => p.path));

                if (success) {
                    const commitNow = await vscode.window.showInformationMessage(
                        `✅ ${problems.length} archivo(s) eliminados del seguimiento. ¿Hacer commit ahora?`,
                        'Sí, commit',
                        'No, lo haré después'
                    );

                    if (commitNow === 'Sí, commit') {
                        await jl_execGitCommand(
                            workspacePath,
                            'git commit -m "chore: remove ignored files from tracking"'
                        );
                        vscode.window.showInformationMessage('✅ Commit realizado. Ejecuta "git push" para subir los cambios.');
                    }
                } else {
                    vscode.window.showErrorMessage('❌ Error al eliminar archivos del seguimiento.');
                }
            }
        } else if (selection.label.includes('Copiar comandos')) {
            // Copy commands to clipboard
            const commands = problems.map(p => `git rm --cached "${p.path}"`).join('\n');
            await vscode.env.clipboard.writeText(commands);
            vscode.window.showInformationMessage('✅ Comandos copiados al portapapeles.');
        } else if (selection.label.includes('Ver archivos')) {
            // Show list of problematic files
            const fileItems = problems.map(p => ({
                label: p.label,
                description: 'Rastreado pero en .gitignore'
            }));

            await vscode.window.showQuickPick(fileItems, {
                title: 'Archivos en .gitignore que siguen siendo rastreados',
                placeHolder: 'Estos archivos deberían ser eliminados del seguimiento'
            });
        }
    });
}
