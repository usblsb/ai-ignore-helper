const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const fileCreator = require('./file_creator');

/**
 * Función auxiliar para añadir un recurso individual a múltiples archivos ignore
 * NOTA: Esta función está siendo reemplazada por la lógica mejorada en add_to_gitignore.js
 * @param {string} resourcePath - Ruta del recurso a añadir
 * @param {Array} ignoreFiles - Array de configuraciones de archivos ignore
 * @returns {Object} Resultados de la operación
 */
async function addToIgnoreFiles(resourcePath, ignoreFiles) {
    try {
        const workspacePath = vscode.workspace.rootPath;
        const relativePath = path.relative(workspacePath, resourcePath).replace(/\\/g, '/');

        const results = {
            added: [],
            skipped: [],
            errors: []
        };

        // Procesar cada archivo ignore de forma secuencial
        for (const ignoreFile of ignoreFiles) {
            try {
                const ignoreFilePath = path.join(workspacePath, ignoreFile.path);

                // Verificar si el archivo existe
                if (!fs.existsSync(ignoreFilePath)) {
                    // Si está configurado para crearse automáticamente
                    if (ignoreFile.createIfNotExists) {
                        // Crear el archivo ignore (y su directorio si es necesario)
                        const created = await fileCreator.createIgnoreFile(ignoreFile.path);
                        if (!created) {
                            results.errors.push({
                                file: ignoreFile.name,
                                path: relativePath,
                                reason: `No se pudo crear el archivo ignore: ${ignoreFile.path}`
                            });
                            continue;
                        }
                        vscode.window.showInformationMessage(`Se ha creado el archivo ignore: ${ignoreFile.path}`);
                    } else {
                        results.errors.push({
                            file: ignoreFile.name,
                            path: relativePath,
                            reason: `El archivo ignore no existe y no está configurado para crearse automáticamente: ${ignoreFile.path}`
                        });
                        continue;
                    }
                }

                // Leer contenido actual con manejo de errores detallado
                let content;
                try {
                    content = fs.readFileSync(ignoreFilePath, 'utf8');
                } catch (readError) {
                    results.errors.push({
                        file: ignoreFile.name,
                        path: relativePath,
                        reason: `Error al leer el archivo: ${readError.message}`
                    });
                    continue;
                }

                // Normalizar saltos de línea
                content = content.replace(/\r\n/g, '\n');

                // Dividir en líneas
                const lines = content.split('\n');

                // Verificar si el archivo ya está ignorado con lógica mejorada
                const normalizedPath = relativePath;
                let alreadyIgnored = false;

                for (const line of lines) {
                    // Normalizar la línea para comparación
                    const normalizedLine = line.trim().replace(/\\/g, '/');
                    // Comparar rutas normalizadas
                    if (normalizedLine === normalizedPath) {
                        alreadyIgnored = true;
                        break;
                    }
                }

                if (alreadyIgnored) {
                    results.skipped.push({
                        file: ignoreFile.name,
                        path: relativePath
                    });
                    continue;
                }

                // Añadir la nueva línea
                lines.push(relativePath);

                // Escribir de vuelta al archivo con manejo de errores
                try {
                    fs.writeFileSync(ignoreFilePath, lines.join('\n'));
                } catch (writeError) {
                    results.errors.push({
                        file: ignoreFile.name,
                        path: relativePath,
                        reason: `Error al escribir en el archivo: ${writeError.message}`
                    });
                    continue;
                }

                results.added.push({
                    file: ignoreFile.name,
                    path: relativePath
                });
            } catch (fileError) {
                results.errors.push({
                    file: ignoreFile.name,
                    path: relativePath,
                    reason: `Error inesperado: ${fileError.message}`
                });
            }
        }

        return results;
    } catch (error) {
        vscode.window.showErrorMessage(`Error al añadir a los archivos ignore: ${error.message}`);
        return {
            added: [],
            skipped: [],
            errors: [{
                file: 'General',
                path: resourcePath,
                reason: error.message
            }]
        };
    }
}

module.exports = {
    addToIgnoreFiles
};