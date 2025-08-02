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
                        name: "Trae Ignore",
                        path: ".trae/.ignore",
                        description: "Archivo ignore para Trae AI",
                        createIfNotExists: true,
                        enabled: true
                    },
                    {
                        name: "Docker Ignore",
                        path: ".dockerignore",
                        description: "Archivo ignore para Docker",
                        createIfNotExists: true,
                        enabled: true
                    },
                    {
                        name: "NPM Ignore",
                        path: ".npmignore",
                        description: "Archivo ignore para NPM",
                        createIfNotExists: true,
                        enabled: true
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