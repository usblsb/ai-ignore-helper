/**
 * IgnoreTreeDataProvider.ts
 * TreeView provider for displaying and managing ignore templates
 * Supports three template sources: default, global, and project
 * @module providers/IgnoreTreeDataProvider
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IgnoreItem, IgnoreFileConfig } from '../types';
import { jl_getVSCodeConfig } from '../commands/settings_sync';

/** Project templates file name */
const PROJECT_TEMPLATES_FILE = 'ai-ignore-templates.json';

/**
 * Category item for grouping templates in the tree
 */
class CategoryItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly category: 'default' | 'global' | 'project',
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded
    ) {
        super(label, collapsibleState);
        this.contextValue = 'category';

        // Set icon based on category
        switch (category) {
            case 'default':
                this.iconPath = new vscode.ThemeIcon('package');
                this.tooltip = 'Built-in templates from the extension';
                break;
            case 'global':
                this.iconPath = new vscode.ThemeIcon('globe');
                this.tooltip = 'Your custom templates (synced with Settings Sync)';
                break;
            case 'project':
                this.iconPath = new vscode.ThemeIcon('folder');
                this.tooltip = 'Project-specific templates from ai-ignore-templates.json';
                break;
        }
    }
}

/**
 * TreeDataProvider for displaying ignore templates in the sidebar panel
 * Organizes templates into three categories: Default, Global, and Project
 */
export class IgnoreTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> =
        new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();

    readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> =
        this._onDidChangeTreeData.event;

    /** Cache of default templates from package.json */
    private defaultTemplates: IgnoreFileConfig[] = [];

    constructor() {
        // Load default templates from package.json configuration schema
        this.loadDefaultTemplates();

        // Listen for configuration changes to refresh the tree
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('ai-ignore')) {
                this.refresh();
            }
        });

        // Watch for project templates file changes
        this.setupProjectTemplatesWatcher();
    }

    /**
     * Loads default templates from the package.json schema defaults
     */
    private loadDefaultTemplates(): void {
        // Get default configuration from package.json
        const config = vscode.workspace.getConfiguration('ai-ignore');
        const inspected = config.inspect<IgnoreFileConfig[]>('ignoreFiles');

        if (inspected?.defaultValue) {
            this.defaultTemplates = inspected.defaultValue.map(t => ({
                ...t,
                source: 'default' as const
            }));
        }
    }

    /**
     * Sets up file watcher for project templates file
     */
    private setupProjectTemplatesWatcher(): void {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) { return; }

        for (const folder of workspaceFolders) {
            const watcher = vscode.workspace.createFileSystemWatcher(
                new vscode.RelativePattern(folder, PROJECT_TEMPLATES_FILE)
            );

            watcher.onDidChange(() => this.refresh());
            watcher.onDidCreate(() => this.refresh());
            watcher.onDidDelete(() => this.refresh());
        }
    }

    /**
     * Refreshes the tree view
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Gets the tree item representation for an element
     * @param element - The tree item
     * @returns TreeItem for display
     */
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    /**
     * Gets the children elements
     * @param element - Parent element (undefined for root)
     * @returns Array of children
     */
    async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
        if (!element) {
            // Root level: return category headers
            return [
                new CategoryItem('📦 Default Templates', 'default'),
                new CategoryItem('🌐 Global Templates', 'global'),
                new CategoryItem('📁 Project Templates', 'project')
            ];
        }

        if (element instanceof CategoryItem) {
            // Return templates for this category
            return this.getTemplatesForCategory(element.category);
        }

        // No nested children for templates
        return [];
    }

    /**
     * Gets templates for a specific category
     * @param category - The template category
     * @returns Array of IgnoreItem for the category
     */
    private async getTemplatesForCategory(category: 'default' | 'global' | 'project'): Promise<IgnoreItem[]> {
        switch (category) {
            case 'default':
                return this.defaultTemplates.map(t => new IgnoreItem(t));

            case 'global':
                return this.getGlobalTemplates();

            case 'project':
                return this.getProjectTemplates();
        }
    }

    /**
     * Gets global templates from user settings
     * Filters out templates that match default templates by path
     */
    private getGlobalTemplates(): IgnoreItem[] {
        const config = jl_getVSCodeConfig();
        const defaultPaths = new Set(this.defaultTemplates.map(t => t.path));

        // Filter to only user-added templates (not in defaults)
        const globalTemplates = config.ignoreFiles
            .filter(t => !defaultPaths.has(t.path))
            .map(t => ({
                ...t,
                source: 'global' as const
            }));

        return globalTemplates.map(t => new IgnoreItem(t));
    }

    /**
     * Gets project-specific templates from ai-ignore-templates.json
     */
    private async getProjectTemplates(): Promise<IgnoreItem[]> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) { return []; }

        const projectTemplates: IgnoreItem[] = [];

        for (const folder of workspaceFolders) {
            const filePath = path.join(folder.uri.fsPath, PROJECT_TEMPLATES_FILE);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const templates = JSON.parse(content) as IgnoreFileConfig[];

                for (const template of templates) {
                    projectTemplates.push(new IgnoreItem({
                        ...template,
                        source: 'project'
                    }));
                }
            } catch {
                // File doesn't exist or is invalid - that's OK
            }
        }

        return projectTemplates;
    }

    /**
     * Gets the parent of an element
     * @param element - The element
     * @returns Parent element or undefined
     */
    getParent(element: vscode.TreeItem): vscode.TreeItem | undefined {
        // We don't track parents for now
        return undefined;
    }
}

/**
 * Saves a template to the project file (ai-ignore-templates.json)
 * @param template - Template to save
 * @returns true if saved successfully
 */
export async function jl_saveProjectTemplate(template: IgnoreFileConfig): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder open. Cannot save project template.');
        return false;
    }

    const filePath = path.join(workspaceFolders[0].uri.fsPath, PROJECT_TEMPLATES_FILE);

    try {
        let templates: IgnoreFileConfig[] = [];

        // Try to read existing file
        try {
            const content = await fs.readFile(filePath, 'utf8');
            templates = JSON.parse(content);
        } catch {
            // File doesn't exist, start with empty array
        }

        // Check if template already exists
        const existingIndex = templates.findIndex(t => t.path === template.path);
        if (existingIndex >= 0) {
            templates[existingIndex] = template;
        } else {
            templates.push(template);
        }

        // Write back
        await fs.writeFile(filePath, JSON.stringify(templates, null, 2), 'utf8');
        return true;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error saving project template: ${errorMessage}`);
        return false;
    }
}

/**
 * Removes a template from the project file
 * @param templatePath - Path of the template to remove
 * @returns true if removed successfully
 */
export async function jl_removeProjectTemplate(templatePath: string): Promise<boolean> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return false;
    }

    const filePath = path.join(workspaceFolders[0].uri.fsPath, PROJECT_TEMPLATES_FILE);

    try {
        const content = await fs.readFile(filePath, 'utf8');
        let templates: IgnoreFileConfig[] = JSON.parse(content);

        templates = templates.filter(t => t.path !== templatePath);

        await fs.writeFile(filePath, JSON.stringify(templates, null, 2), 'utf8');
        return true;
    } catch (error) {
        return false;
    }
}
