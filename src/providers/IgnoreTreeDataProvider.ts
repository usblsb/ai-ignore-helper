/**
 * IgnoreTreeDataProvider.ts
 * TreeView provider for displaying and managing ignore templates
 * @module providers/IgnoreTreeDataProvider
 */

import * as vscode from 'vscode';
import { IgnoreItem, IgnoreFileConfig } from '../types';
import { jl_getVSCodeConfig } from '../commands/settings_sync';

/**
 * TreeDataProvider for displaying ignore templates in the sidebar panel
 */
export class IgnoreTreeDataProvider implements vscode.TreeDataProvider<IgnoreItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<IgnoreItem | undefined | null | void> =
        new vscode.EventEmitter<IgnoreItem | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<IgnoreItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    constructor() {
        // Listen for configuration changes to refresh the tree
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('ai-ignore')) {
                this.refresh();
            }
        });
    }

    /**
     * Refreshes the tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Gets the tree item representation for an element
     * @param element - The ignore item
     * @returns TreeItem for display
     */
    getTreeItem(element: IgnoreItem): vscode.TreeItem {
        return element;
    }

    /**
     * Gets the children elements
     * @param element - Parent element (undefined for root)
     * @returns Array of IgnoreItem children
     */
    getChildren(element?: IgnoreItem): Thenable<IgnoreItem[]> {
        if (element) {
            // No nested children for now
            return Promise.resolve([]);
        }

        // Get all configured ignore templates
        const config = jl_getVSCodeConfig();
        const items = config.ignoreFiles.map(
            (file: IgnoreFileConfig) => new IgnoreItem(file)
        );

        return Promise.resolve(items);
    }

    /**
     * Gets the parent of an element
     * @param element - The element
     * @returns Parent element or undefined
     */
    getParent(element: IgnoreItem): IgnoreItem | undefined {
        // Flat structure, no parents
        return undefined;
    }
}
