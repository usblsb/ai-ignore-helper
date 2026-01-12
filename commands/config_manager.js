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
 * Guarda la configuración en VS Code Settings (método principal)
 * @param {Object} config - Configuración a guardar
 * @returns {boolean} true si se guardó exitosamente, false en caso de error
 */
async function saveConfig(config) {
	try {
		const vsConfig = vscode.workspace.getConfiguration('ai-ignore');
		
		// Determinar el target: Preferimos Global para evitar polución, 
		// pero si el usuario ya tiene configuraciones en el workspace, mantenemos la coherencia
		const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Global;
		// Nota: Forzamos Global por ahora según los requerimientos de no polución.

		// Actualizar archivos ignore
		await vsConfig.update('ignoreFiles', config.ignoreFiles, target);
		
		// Actualizar comportamiento por defecto si existe
		if (config.defaultBehavior) {
			await vsConfig.update('showSelectionMenu', config.defaultBehavior.showSelectionMenu, target);
			await vsConfig.update('allowMultipleSelection', config.defaultBehavior.allowMultipleSelection, target);
			await vsConfig.update('createDirectories', config.defaultBehavior.createDirectories, target);
			await vsConfig.update('showConfirmation', config.defaultBehavior.showConfirmation, target);
		}
		
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