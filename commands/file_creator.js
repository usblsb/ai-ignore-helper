const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function createIgnoreFile(filePath) {
    try {
        const fullPath = path.join(vscode.workspace.rootPath, filePath);
        const dirName = path.dirname(fullPath);

        // Crear directorio si no existe (incluyendo toda la estructura de carpetas necesaria)
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        // Crear archivo si no existe
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, '');
        }

        return true;
    } catch (error) {
        vscode.window.showErrorMessage(`Error al crear el archivo ignore: ${error.message}`);
        return false;
    }
}

module.exports = {
    createIgnoreFile
};