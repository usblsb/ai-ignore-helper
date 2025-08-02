const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Crea un archivo ignore y su estructura de directorios si no existen
 * @param {string} filePath - Ruta relativa del archivo ignore a crear
 * @returns {boolean} true si se creó exitosamente, false en caso de error
 */
async function createIgnoreFile(filePath) {
    try {
        // Construir la ruta completa del archivo ignore
        const fullPath = path.join(vscode.workspace.rootPath, filePath);
        const dirName = path.dirname(fullPath);

        // Crear toda la estructura de directorios necesaria si no existe
        // El flag 'recursive: true' crea todos los directorios padre necesarios
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        // Crear el archivo ignore vacío si no existe
        // Esto permite que el usuario empiece con un archivo limpio
        if (!fs.existsSync(fullPath)) {
            fs.writeFileSync(fullPath, '');
        }

        return true;
    } catch (error) {
        // Mostrar error al usuario y retornar false para indicar fallo
        vscode.window.showErrorMessage(`Error al crear el archivo ignore: ${error.message}`);
        return false;
    }
}

module.exports = {
    createIgnoreFile
};