const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function openConfig() {
    try {
        const configPath = path.join(vscode.workspace.rootPath, 'config', 'ignore-files-config.json');

        // Verificar si el archivo existe
        if (!fs.existsSync(configPath)) {
            // Crear directorio config si no existe
            const configDir = path.join(vscode.workspace.rootPath, 'config');
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            // Crear archivo de configuración por defecto
            const defaultConfig = {
                ignoreFiles: [
                    {
                        "name": "Trae Ignore",
                        "path": ".trae/.ignore",
                        "description": "Archivo ignore para Trae AI",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Docker Ignore",
                        "path": ".dockerignore",
                        "description": "Archivo ignore para Docker",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "NPM Ignore",
                        "path": ".npmignore",
                        "description": "Archivo ignore para NPM",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "GIT Ignore",
                        "path": ".gitignore",
                        "description": "Archivo ignore para GIT",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "ESLint Ignore",
                        "path": ".eslintignore",
                        "description": "Archivo ignore para ESLint",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Prettier Ignore",
                        "path": ".prettierignore",
                        "description": "Archivo ignore para Prettier",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Sourcegraph Ignore",
                        "path": ".sourcegraphignore",
                        "description": "Archivo ignore para Sourcegraph Cody",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Jest Ignore",
                        "path": ".jestignore",
                        "description": "Archivo ignore para Jest",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Webpack Ignore",
                        "path": ".webpackignore",
                        "description": "Archivo ignore para Webpack",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Babel Ignore",
                        "path": ".babelignore",
                        "description": "Archivo ignore para Babel",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Stylelint Ignore",
                        "path": ".stylelintignore",
                        "description": "Archivo ignore para Stylelint",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Markdownlint Ignore",
                        "path": ".markdownlintignore",
                        "description": "Archivo ignore para Markdownlint",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "TypeScript Ignore",
                        "path": ".tsignore",
                        "description": "Archivo ignore para TypeScript",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Roocode Ignore",
                        "path": ".roocodeignore",
                        "description": "Archivo ignore para Roocode AI",
                        "createIfNotExists": true,
                        "enabled": true
                    },
                    {
                        "name": "Cline Ignore",
                        "path": ".clineignore",
                        "description": "Archivo ignore para Cline AI",
                        "createIfNotExists": true,
                        "enabled": true
                    }
                ],
                defaultBehavior: {
                    showSelectionMenu: true,
                    allowMultipleSelection: true,
                    createDirectories: true,
                    showConfirmation: true
                }
            };

            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
            vscode.window.showInformationMessage('Archivo de configuración creado con valores por defecto.');
        }

        // Abrir el archivo de configuración
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
    } catch (error) {
        vscode.window.showErrorMessage(`Error al abrir el archivo de configuración: ${error.message}`);
    }
}

module.exports = openConfig;