const vscode = require('vscode');
const path = require('path');
const fs = require('fs').promises;
const configManager = require('./config_manager');

/**
 * Función principal para añadir archivos y carpetas a archivos ignore
 * @param {vscode.Uri|vscode.Uri[]} resourceUris - URI(s) de los recursos a añadir
 */
async function addToIgnore(resourceUris) {
    try {
        // Normalizar la entrada: convertir a array si es necesario
        // Esto permite manejar tanto selecciones individuales como múltiples
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

        // Cargar la configuración desde el archivo ignore-files-config.json
        const config = configManager.loadConfig();
        if (!config) {
            return;
        }

        // Filtrar solo los archivos ignore que están habilitados en la configuración
        // Esto permite al usuario deshabilitar ciertos tipos de archivos ignore
        const enabledIgnoreFiles = config.ignoreFiles.filter(file => file.enabled);

        if (enabledIgnoreFiles.length === 0) {
            vscode.window.showInformationMessage('No ignore files are enabled in the configuration');
            return;
        }

        let selectedFiles = [];

        // Mostrar menú de selección si está configurado en defaultBehavior
        // Esto permite al usuario elegir específicamente a qué archivos ignore añadir
        if (config.defaultBehavior.showSelectionMenu) {
            // Crear elementos para el menú de selección con información descriptiva
            const items = enabledIgnoreFiles.map(file => ({
                label: file.name,
                description: file.path,
                detail: file.description,
                file: file
            }));

            // Configurar opciones del menú según la configuración
            const options = {
                placeHolder: 'Select ignore files to add to',
                canPickMany: config.defaultBehavior.allowMultipleSelection
            };

            const selected = await vscode.window.showQuickPick(items, options);

            if (!selected || selected.length === 0) {
                return; // Usuario canceló la operación
            }

            // Extraer los objetos de archivo de la selección
            selectedFiles = selected.map(item => item.file);
        } else {
            // Si no se muestra menú, usar todos los archivos ignore habilitados
            selectedFiles = enabledIgnoreFiles;
        }

        // Mostrar diálogo de confirmación si está configurado
        // Esto da al usuario una última oportunidad de cancelar la operación
        if (config.defaultBehavior.showConfirmation) {
            const resourceNames = resources.map(r => path.basename(r.fsPath)).join(', ');
            const fileNames = selectedFiles.map(file => file.name).join(', ');
            const confirm = await vscode.window.showInformationMessage(
                `Add ${resourceNames} to ${fileNames}?`,
                { modal: true },
                'Yes', 'No'
            );

            if (confirm !== 'Yes') {
                return; // Usuario canceló la operación
            }
        }

        // Inicializar objeto para recopilar todos los resultados de la operación
        const allResults = {
            added: [],     // Archivos añadidos exitosamente
            skipped: [],   // Archivos que ya existían (duplicados)
            errors: []     // Errores encontrados durante el procesamiento
        };

        // Procesar cada archivo ignore seleccionado de forma secuencial
        // Esto asegura que todos los archivos ignore reciban las mismas entradas
        for (const ignoreFile of selectedFiles) {
            try {
                const ignoreFilePath = path.join(vscode.workspace.rootPath, ignoreFile.path);

                // Verificar si el archivo ignore existe, y crearlo si es necesario
                let fileExists = false;
                try {
                    await fs.access(ignoreFilePath);
                    fileExists = true;
                } catch (error) {
                    // El archivo no existe, verificar si debe crearse automáticamente
                    if (ignoreFile.createIfNotExists) {
                        // Crear toda la estructura de directorios necesaria
                        const dirPath = path.dirname(ignoreFilePath);
                        await fs.mkdir(dirPath, { recursive: true });

                        // Crear el archivo ignore vacío
                        await fs.writeFile(ignoreFilePath, '');
                        fileExists = true;
                        vscode.window.showInformationMessage(`Created ignore file: ${ignoreFile.path}`);
                    } else {
                        // El archivo no existe y no está configurado para crearse
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
                const originalLines = content.split(/\r?\n/);

                // Crear un conjunto (Set) con las rutas existentes para búsquedas O(1)
                // Esto mejora significativamente el rendimiento al verificar duplicados
                const existingPaths = new Set();
                originalLines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine) {
                        existingPaths.add(trimmedLine);
                    }
                });

                // Crear un conjunto separado para las nuevas rutas a añadir
                // Esto evita duplicados cuando se procesan múltiples archivos en la misma operación
                const newPathsToAdd = new Set();

                // Procesar cada recurso seleccionado individualmente
                // CORRECCIÓN: Este bucle ahora maneja correctamente múltiples archivos
                for (const resource of resources) {
                    try {
                        // Validar que el recurso tenga una ruta válida
                        if (!resource || !resource.fsPath) {
                            allResults.errors.push({
                                file: ignoreFile.name,
                                path: 'Invalid resource',
                                reason: 'Resource is invalid or has no path'
                            });
                            continue;
                        }

                        // Convertir la ruta absoluta a relativa y normalizar separadores
                        const relativePath = path.relative(vscode.workspace.rootPath, resource.fsPath).replace(/\\/g, '/');

                        // Verificar duplicados: tanto en el archivo existente como en esta operación
                        if (existingPaths.has(relativePath)) {
                            // El archivo ya existe en el archivo ignore
                            allResults.skipped.push({
                                file: ignoreFile.name,
                                path: relativePath
                            });
                        } else if (newPathsToAdd.has(relativePath)) {
                            // Ya fue añadido en esta misma operación (evita duplicados internos)
                            allResults.skipped.push({
                                file: ignoreFile.name,
                                path: relativePath
                            });
                        } else {
                            // Añadir la nueva ruta a ambos conjuntos de seguimiento
                            newPathsToAdd.add(relativePath);
                            allResults.added.push({
                                file: ignoreFile.name,
                                path: relativePath
                            });
                        }
                    } catch (resourceError) {
                        allResults.errors.push({
                            file: ignoreFile.name,
                            path: resource?.fsPath || 'Unknown',
                            reason: `Error processing resource: ${resourceError.message}`
                        });
                    }
                }

                // Reconstruir el archivo completo preservando el formato original
                const updatedLines = [];

                // Mantener todas las líneas existentes en su orden original
                // Esto preserva comentarios, líneas vacías y el formato del usuario
                originalLines.forEach(line => {
                    updatedLines.push(line);
                });

                // Añadir las nuevas rutas al final del archivo
                // Solo se añaden las rutas que no existían previamente
                newPathsToAdd.forEach(newPath => {
                    updatedLines.push(newPath);
                });

                // Escribir el contenido actualizado de vuelta al archivo ignore
                await fs.writeFile(ignoreFilePath, updatedLines.join('\n'));

                // Mostrar notificación del progreso para este archivo ignore específico
                const addedCount = allResults.added.filter(item => item.file === ignoreFile.name).length;
                if (addedCount > 0) {
                    vscode.window.showInformationMessage(`Added ${addedCount} entries to ${ignoreFile.name}`);
                }

            } catch (error) {
                // Capturar cualquier error inesperado durante el procesamiento
                allResults.errors.push({
                    file: ignoreFile.name,
                    path: 'Multiple files',
                    reason: `Error processing ignore file: ${error.message}`
                });
            }
        }

        // Generar y mostrar resumen final de toda la operación
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