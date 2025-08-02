const vscode = require('vscode');
const path = require('path');
const configManager = require('./config_manager');
const ignoreHandler = require('./ignore_handler');

async function addToIgnore(resourceUris) {
    try {
        // Verificar si se recibió un array de recursos o un solo recurso
        let resources = [];
        if (Array.isArray(resourceUris)) {
            resources = resourceUris;
        } else if (resourceUris) {
            resources = [resourceUris];
        } else {
            vscode.window.showErrorMessage('No resource selected');
            return;
        }

        if (resources.length === 0) {
            vscode.window.showErrorMessage('No resources selected');
            return;
        }

        // Cargar configuración
        const config = configManager.loadConfig();
        if (!config) {
            return;
        }

        // Filtrar archivos ignore habilitados
        const enabledIgnoreFiles = config.ignoreFiles.filter(file => file.enabled);

        if (enabledIgnoreFiles.length === 0) {
            vscode.window.showInformationMessage('No ignore files are enabled in the configuration');
            return;
        }

        let selectedFiles = [];

        // Mostrar menú de selección si está configurado
        if (config.defaultBehavior.showSelectionMenu) {
            const items = enabledIgnoreFiles.map(file => ({
                label: file.name,
                description: file.path,
                detail: file.description,
                file: file
            }));

            const options = {
                placeHolder: 'Select ignore files to add to',
                canPickMany: config.defaultBehavior.allowMultipleSelection
            };

            const selected = await vscode.window.showQuickPick(items, options);

            if (!selected || selected.length === 0) {
                return; // Usuario canceló
            }

            selectedFiles = selected.map(item => item.file);
        } else {
            // Usar todos los archivos habilitados
            selectedFiles = enabledIgnoreFiles;
        }

        // Mostrar confirmación si está configurado
        if (config.defaultBehavior.showConfirmation) {
            const resourceNames = resources.map(r => path.basename(r.fsPath)).join(', ');
            const fileNames = selectedFiles.map(file => file.name).join(', ');
            const confirm = await vscode.window.showInformationMessage(
                `Add ${resourceNames} to ${fileNames}?`,
                { modal: true },
                'Yes', 'No'
            );

            if (confirm !== 'Yes') {
                return; // Usuario canceló
            }
        }

        // Procesar cada recurso
        const results = [];
        for (const resource of resources) {
            const result = await ignoreHandler.addToIgnoreFiles(resource.fsPath, selectedFiles);
            results.push({
                resource: resource.fsPath,
                success: result
            });
        }

        // Mostrar resumen
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        if (failCount === 0) {
            vscode.window.showInformationMessage(`Successfully added ${successCount} resources to ignore files.`);
        } else {
            vscode.window.showWarningMessage(`Added ${successCount} resources to ignore files. Failed for ${failCount} resources.`);
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

module.exports = addToIgnore;