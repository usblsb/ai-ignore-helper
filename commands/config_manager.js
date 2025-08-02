const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const settingsSync = require('./settings_sync');

/**
 * Carga la configuración desde VS Code Settings (fuente principal)
 * @returns {Object|null} Configuración cargada o null si hay error
 */
function loadConfig() {
	try {
		// Obtener configuración desde VS Code Settings
		const config = settingsSync.getVSCodeConfig();
		
		// Verificar que la configuración tiene datos válidos
		if (!config || !config.ignoreFiles || !Array.isArray(config.ignoreFiles)) {
			throw new Error('Invalid configuration. Please check your settings or activate the extension.');
		}
		
		return config;
	} catch (error) {
		// Mostrar error al usuario y retornar null
		vscode.window.showErrorMessage(`Error loading configuration: ${error.message}`);
		return null;
	}
}

/**
 * Carga la configuración desde el archivo JSON (método legacy)
 * @returns {Object|null} Configuración cargada o null si hay error
 */
function loadConfigFromJSON() {
	try {
		// Construir la ruta al archivo de configuración
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			throw new Error('No workspace folder found');
		}
		
		const configPath = path.join(workspaceRoot, 'config', 'ignore-files-config.json');
		
		// Verificar que el archivo de configuración existe
		if (!fs.existsSync(configPath)) {
			throw new Error('Configuration file not found. Please activate the extension first.');
		}
		
		// Leer y parsear el contenido JSON
		const configContent = fs.readFileSync(configPath, 'utf8');
		return JSON.parse(configContent);
	} catch (error) {
		// Mostrar error al usuario y retornar null
		vscode.window.showErrorMessage(`Error loading JSON configuration: ${error.message}`);
		return null;
	}
}

/**
 * Guarda la configuración en VS Code Settings (método principal)
 * @param {Object} config - Configuración a guardar
 * @returns {boolean} true si se guardó exitosamente, false en caso de error
 */
async function saveConfig(config) {
	try {
		const vsConfig = vscode.workspace.getConfiguration('ai-ignore');
		
		// Actualizar archivos ignore
		await vsConfig.update('ignoreFiles', config.ignoreFiles, vscode.ConfigurationTarget.Workspace);
		
		// Actualizar comportamiento por defecto si existe
		if (config.defaultBehavior) {
			await vsConfig.update('showSelectionMenu', config.defaultBehavior.showSelectionMenu, vscode.ConfigurationTarget.Workspace);
			await vsConfig.update('allowMultipleSelection', config.defaultBehavior.allowMultipleSelection, vscode.ConfigurationTarget.Workspace);
			await vsConfig.update('createDirectories', config.defaultBehavior.createDirectories, vscode.ConfigurationTarget.Workspace);
			await vsConfig.update('showConfirmation', config.defaultBehavior.showConfirmation, vscode.ConfigurationTarget.Workspace);
		}
		
		// Sincronizar automáticamente al archivo JSON
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (workspaceRoot) {
			const configPath = path.join(workspaceRoot, 'config', 'ignore-files-config.json');
			await settingsSync.updateJSONFromSettings(configPath);
		}
		
		return true;
	} catch (error) {
		// Mostrar error al usuario y retornar false
		vscode.window.showErrorMessage(`Error saving configuration: ${error.message}`);
		return false;
	}
}

/**
 * Guarda la configuración al archivo JSON (método legacy)
 * @param {Object} config - Configuración a guardar
 * @returns {boolean} true si se guardó exitosamente, false en caso de error
 */
function saveConfigToJSON(config) {
	try {
		// Construir la ruta al archivo de configuración
		const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		if (!workspaceRoot) {
			throw new Error('No workspace folder found');
		}
		
		const configPath = path.join(workspaceRoot, 'config', 'ignore-files-config.json');
		// Escribir la configuración con formato JSON legible (indentación de 2 espacios)
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
		return true;
	} catch (error) {
		// Mostrar error al usuario y retornar false
		vscode.window.showErrorMessage(`Error saving JSON configuration: ${error.message}`);
		return false;
	}
}

module.exports = {
	loadConfig,
	saveConfig,
	loadConfigFromJSON,
	saveConfigToJSON
};