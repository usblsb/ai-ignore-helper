const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

/**
 * Carga la configuración de archivos ignore desde el archivo JSON
 * @returns {Object|null} Configuración cargada o null si hay error
 */
function loadConfig() {
	try {
		// Construir la ruta al archivo de configuración
		const configPath = path.join(vscode.workspace.rootPath, 'config', 'ignore-files-config.json');
		
		// Verificar que el archivo de configuración existe
		if (!fs.existsSync(configPath)) {
			throw new Error('Configuration file not found. Please activate the extension first.');
		}
		
		// Leer y parsear el contenido JSON
		const configContent = fs.readFileSync(configPath, 'utf8');
		return JSON.parse(configContent);
	} catch (error) {
		// Mostrar error al usuario y retornar null
		vscode.window.showErrorMessage(`Error loading configuration: ${error.message}`);
		return null;
	}
}

/**
 * Guarda la configuración de archivos ignore al archivo JSON
 * @param {Object} config - Configuración a guardar
 * @returns {boolean} true si se guardó exitosamente, false en caso de error
 */
function saveConfig(config) {
	try {
		// Construir la ruta al archivo de configuración
		const configPath = path.join(vscode.workspace.rootPath, 'config', 'ignore-files-config.json');
		// Escribir la configuración con formato JSON legible (indentación de 2 espacios)
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
		return true;
	} catch (error) {
		// Mostrar error al usuario y retornar false
		vscode.window.showErrorMessage(`Error saving configuration: ${error.message}`);
		return false;
	}
}

module.exports = {
	loadConfig,
	saveConfig
};