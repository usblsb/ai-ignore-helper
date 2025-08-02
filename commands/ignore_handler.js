const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const fileCreator = require('./file_creator');

async function addToIgnoreFiles(resourcePath, ignoreFiles) {
    try {
        const workspacePath = vscode.workspace.rootPath;
        const relativePath = path.relative(workspacePath, resourcePath);

        for (const ignoreFile of ignoreFiles) {
            const ignoreFilePath = path.join(workspacePath, ignoreFile.path);

            // Verificar si el archivo existe
            if (!fs.existsSync(ignoreFilePath)) {
                // Si está configurado para crearse automáticamente
                if (ignoreFile.createIfNotExists) {
                    // Crear el archivo ignore (y su directorio si es necesario)
                    const created = await fileCreator.createIgnoreFile(ignoreFile.path);
                    if (!created) {
                        vscode.window.showWarningMessage(`No se pudo crear el archivo ignore: ${ignoreFile.path}`);
                        continue;
                    }
                    vscode.window.showInformationMessage(`Se ha creado el archivo ignore: ${ignoreFile.path}`);
                } else {
                    vscode.window.showWarningMessage(`El archivo ignore no existe y no está configurado para crearse automáticamente: ${ignoreFile.path}`);
                    continue;
                }
            }

            // Leer contenido actual
            let content = fs.readFileSync(ignoreFilePath, 'utf8');

            // Normalizar saltos de línea
            content = content.replace(/\r\n/g, '\n');

            // Dividir en líneas
            const lines = content.split('\n');

            // Verificar si el archivo ya está ignorado
            if (lines.includes(relativePath)) {
                vscode.window.showInformationMessage(`${relativePath} ya está en ${ignoreFile.name}`);
                continue;
            }

            // Añadir la nueva línea
            lines.push(relativePath);

            // Escribir de vuelta al archivo
            fs.writeFileSync(ignoreFilePath, lines.join('\n'));

            vscode.window.showInformationMessage(`Añadido ${relativePath} a ${ignoreFile.name}`);
        }

        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error al añadir a los archivos ignore: ${error.message}`);
        return false;
    }
}

module.exports = {
    addToIgnoreFiles
};