/**
 * Type definitions for AI Ignore Helper extension
 * @module types/index
 */

import * as vscode from 'vscode';

/**
 * Configuration for a single ignore file template
 */
export interface IgnoreFileConfig {
    /** Display name for the ignore file */
    name: string;
    /** Relative path of the ignore file */
    path: string;
    /** Description of the ignore file's purpose */
    description: string;
    /** Whether to create the file if it doesn't exist */
    createIfNotExists: boolean;
    /** Whether this ignore file is enabled */
    enabled: boolean;
    /** Source of template: default (package.json), global (user settings), project (ai-ignore-templates.json) */
    source?: 'default' | 'global' | 'project';
}

/**
 * Default behavior configuration
 */
export interface DefaultBehavior {
    /** Show selection menu when adding to ignore */
    showSelectionMenu: boolean;
    /** Allow selecting multiple ignore files */
    allowMultipleSelection: boolean;
    /** Create directories automatically if they don't exist */
    createDirectories: boolean;
    /** Show confirmation before adding files */
    showConfirmation: boolean;
}

/**
 * Complete extension configuration
 */
export interface ExtensionConfig {
    /** List of configured ignore files */
    ignoreFiles: IgnoreFileConfig[];
    /** Default behavior settings */
    defaultBehavior: DefaultBehavior;
}

/**
 * Tree item representing an ignore template in the sidebar panel
 */
export class IgnoreItem extends vscode.TreeItem {
    constructor(
        public readonly config: IgnoreFileConfig,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        super(config.name, collapsibleState);
        this.tooltip = `${config.description}\nPath: ${config.path}\nSource: ${config.source || 'global'}`;
        this.description = config.path;
        this.contextValue = 'ignoreItem';

        // Icon based on source and enabled status
        if (!config.enabled) {
            this.iconPath = new vscode.ThemeIcon('circle-slash');
        } else {
            switch (config.source) {
                case 'default':
                    this.iconPath = new vscode.ThemeIcon('package');
                    break;
                case 'project':
                    this.iconPath = new vscode.ThemeIcon('folder');
                    break;
                case 'global':
                default:
                    this.iconPath = new vscode.ThemeIcon('globe');
                    break;
            }
        }
    }
}
