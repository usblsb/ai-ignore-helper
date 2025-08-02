const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const configManager = require('./config_manager');

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

        // Procesar cada archivo ignore
        const allResults = {
            added: [],
            skipped: [],
            errors: []
        };

        // Procesar cada archivo ignore por separado
        for (const ignoreFile of selectedFiles) {
            try {
                const ignoreFilePath = path.join(vscode.workspace.rootPath, ignoreFile.path);

                // Verificar si el archivo existe, si no, crearlo
                let fileExists = false;
                try {
                    await fs.access(ignoreFilePath);
                    fileExists = true;
                } catch (error) {
                    // El archivo no existe
                    if (ignoreFile.createIfNotExists) {
                        // Crear directorios si es necesario
                        const dirPath = path.dirname(ignoreFilePath);
                        await fs.mkdir(dirPath, { recursive: true });

                        // Crear el archivo ignore vacío
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

                // Leer el contenido actual del archivo ignore
                const content = await fs.readFile(ignoreFilePath, 'utf8');
                const lines = content.split(/\r?\n/);

                // Procesar cada recurso para este archivo ignore
                for (const resource of resources) {
                    const relativePath = path.relative(vscode.workspace.rootPath, resource.fsPath).replace(/\\/g, '/');

                    // Verificar si el archivo ya está en el ignore
                    const alreadyExists = lines.some(line => line.trim() === relativePath);

                    if (alreadyExists) {
                        allResults.skipped.push({
                            file: ignoreFile.name,
                            path: relativePath
                        });
                    } else {
                        // Añadir el archivo al ignore
                        lines.push(relativePath);
                        allResults.added.push({
                            file: ignoreFile.name,
                            path: relativePath
                        });
                    }
                }

                // Eliminar duplicados manteniendo el orden
                const uniqueLines = [];
                const seen = new Set();

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine && !seen.has(trimmedLine)) {
                        seen.add(trimmedLine);
                        uniqueLines.push(line);
                    } else if (!trimmedLine) {
                        // Mantener líneas vacías
                        uniqueLines.push(line);
                    }
                }

                // Escribir el contenido actualizado al archivo ignore
                await fs.writeFile(ignoreFilePath, uniqueLines.join('\n'));

                // Mostrar información sobre los archivos añadidos
                const addedCount = allResults.added.filter(item => item.file === ignoreFile.name).length;
                if (addedCount > 0) {
                    vscode.window.showInformationMessage(`Added ${addedCount} entries to ${ignoreFile.name}`);
                }

            } catch (error) {
                allResults.errors.push({
                    file: ignoreFile.name,
                    path: 'Multiple files',
                    reason: `Error processing ignore file: ${error.message}`
                });
            }
        }

        // Mostrar resumen
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
            // Mostrar mensaje con opción de ver detalles
            vscode.window.showInformationMessage(message, 'View Details').then(selection => {
                if (selection === 'View Details') {
                    // Crear un documento con los detalles
                    const details = [];

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

                    // Mostrar en un nuevo documento
                    vscode.workspace.openTextDocument({ content: details.join('\n'), language: 'plaintext' })
                        .then(doc => vscode.window.showTextDocument(doc));
                }
            });
        } else {
            vscode.window.showInformationMessage('No changes made.');
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error.message}`);
    }
}

module.exports = addToIgnore;