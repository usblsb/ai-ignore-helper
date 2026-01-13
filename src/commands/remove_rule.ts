/**
 * remove_rule.ts
 * Command to remove an existing ignore rule
 * @module commands/remove_rule
 */

import * as vscode from 'vscode';
import { jl_loadConfig, jl_saveConfig } from './config_manager';
import { IgnoreFileConfig } from '../types';

interface RulePickItem extends vscode.QuickPickItem {
    rule: IgnoreFileConfig;
}

/**
 * Prompts user to select and remove an existing ignore rule
 */
export async function jl_removeRule(): Promise<void> {
    try {
        const currentConfig = jl_loadConfig();
        if (!currentConfig) { return; }

        if (!currentConfig.ignoreFiles || currentConfig.ignoreFiles.length === 0) {
            vscode.window.showInformationMessage('No rules to remove.');
            return;
        }

        const items: RulePickItem[] = currentConfig.ignoreFiles.map((f) => ({
            label: f.name,
            description: f.path,
            detail: f.description || '',
            rule: f
        }));

        const picked = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select rule to remove',
            canPickMany: false
        });
        if (!picked) { return; }

        const confirm = await vscode.window.showInformationMessage(
            `Delete rule "${picked.rule.name}" (${picked.rule.path})?`,
            { modal: true },
            'Yes',
            'No'
        );
        if (confirm !== 'Yes') { return; }

        const newConfig = {
            ...currentConfig,
            ignoreFiles: currentConfig.ignoreFiles.filter((r) => r.path !== picked.rule.path)
        };

        const ok = await jl_saveConfig(newConfig);
        if (ok) {
            vscode.window.showInformationMessage('Rule removed.');
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error removing rule: ${errorMessage}`);
    }
}
