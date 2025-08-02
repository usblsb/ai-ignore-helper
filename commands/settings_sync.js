/**
 * settings_sync.js
 * Módulo para sincronizar configuraciones entre VS Code Settings y el archivo JSON
 */

const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

/**
 * Obtiene la configuración desde VS Code Settings
 * @returns {Object} Configuración completa
 */
function getVSCodeConfig() {
  const config = vscode.workspace.getConfiguration('ai-ignore');
  
  return {
    ignoreFiles: config.get('ignoreFiles', []),
    defaultBehavior: {
      showSelectionMenu: config.get('showSelectionMenu', true),
      allowMultipleSelection: config.get('allowMultipleSelection', true),
      createDirectories: config.get('createDirectories', true),
      showConfirmation: config.get('showConfirmation', true)
    }
  };
}

/**
 * Actualiza VS Code Settings con la configuración del archivo JSON
 * @param {Object} jsonConfig - Configuración del archivo JSON
 */
async function updateVSCodeSettings(jsonConfig) {
  const config = vscode.workspace.getConfiguration('ai-ignore');
  
  try {
    // Actualizar archivos ignore
    await config.update('ignoreFiles', jsonConfig.ignoreFiles, vscode.ConfigurationTarget.Workspace);
    
    // Actualizar comportamiento por defecto
    if (jsonConfig.defaultBehavior) {
      await config.update('showSelectionMenu', jsonConfig.defaultBehavior.showSelectionMenu, vscode.ConfigurationTarget.Workspace);
      await config.update('allowMultipleSelection', jsonConfig.defaultBehavior.allowMultipleSelection, vscode.ConfigurationTarget.Workspace);
      await config.update('createDirectories', jsonConfig.defaultBehavior.createDirectories, vscode.ConfigurationTarget.Workspace);
      await config.update('showConfirmation', jsonConfig.defaultBehavior.showConfirmation, vscode.ConfigurationTarget.Workspace);
    }
    
    console.log('VS Code Settings actualizados correctamente');
  } catch (error) {
    console.error('Error actualizando VS Code Settings:', error);
    vscode.window.showErrorMessage('Error actualizando configuración: ' + error.message);
  }
}

/**
 * Actualiza el archivo JSON con la configuración de VS Code Settings
 * @param {string} configPath - Ruta del archivo de configuración JSON
 */
async function updateJSONFromSettings(configPath) {
  try {
    const vsCodeConfig = getVSCodeConfig();
    
    // Crear directorio si no existe
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });
    
    // Escribir archivo JSON
    await fs.writeFile(configPath, JSON.stringify(vsCodeConfig, null, 2), 'utf8');
    
    console.log('Archivo JSON actualizado desde VS Code Settings');
  } catch (error) {
    console.error('Error actualizando archivo JSON:', error);
    vscode.window.showErrorMessage('Error actualizando archivo de configuración: ' + error.message);
  }
}

/**
 * Sincroniza configuración desde archivo JSON a VS Code Settings
 * @param {string} configPath - Ruta del archivo de configuración JSON
 */
async function syncFromJSON(configPath) {
  try {
    const jsonContent = await fs.readFile(configPath, 'utf8');
    const jsonConfig = JSON.parse(jsonContent);
    
    await updateVSCodeSettings(jsonConfig);
    
    vscode.window.showInformationMessage('Configuración sincronizada desde archivo JSON');
  } catch (error) {
    console.error('Error sincronizando desde JSON:', error);
    vscode.window.showErrorMessage('Error leyendo configuración: ' + error.message);
  }
}

/**
 * Sincroniza configuración desde VS Code Settings a archivo JSON
 * @param {string} configPath - Ruta del archivo de configuración JSON
 */
async function syncToJSON(configPath) {
  try {
    await updateJSONFromSettings(configPath);
    vscode.window.showInformationMessage('Configuración sincronizada a archivo JSON');
  } catch (error) {
    console.error('Error sincronizando a JSON:', error);
  }
}

/**
 * Configura el listener para cambios en la configuración
 * @param {string} configPath - Ruta del archivo de configuración JSON
 */
function setupConfigurationListener(configPath) {
  return vscode.workspace.onDidChangeConfiguration(async (event) => {
    // Solo reaccionar a cambios en nuestra configuración
    if (event.affectsConfiguration('ai-ignore')) {
      console.log('Configuración AI Ignore cambió, sincronizando...');
      await updateJSONFromSettings(configPath);
    }
  });
}

/**
 * Inicializa la sincronización bidireccional
 * @param {string} configPath - Ruta del archivo de configuración JSON
 */
async function initializeSync(configPath) {
  try {
    // Verificar si existe el archivo JSON
    const jsonExists = await fs.access(configPath).then(() => true).catch(() => false);
    
    if (jsonExists) {
      // Si existe JSON, sincronizar a VS Code Settings
      await syncFromJSON(configPath);
    } else {
      // Si no existe JSON, crear desde VS Code Settings
      await updateJSONFromSettings(configPath);
    }
    
    // Configurar listener para cambios futuros
    const disposable = setupConfigurationListener(configPath);
    
    return disposable;
  } catch (error) {
    console.error('Error inicializando sincronización:', error);
    vscode.window.showErrorMessage('Error inicializando sincronización de configuración');
  }
}

module.exports = {
  getVSCodeConfig,
  updateVSCodeSettings,
  updateJSONFromSettings,
  syncFromJSON,
  syncToJSON,
  setupConfigurationListener,
  initializeSync
};