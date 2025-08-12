/**
 * settings_sync.js
 * Módulo para sincronizar configuraciones entre VS Code Settings y el archivo JSON
 */

const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

// Banderas para evitar bucles de sincronización entre JSON y Settings
let isSyncingFromJSON = false;
let isSyncingToJSON = false;

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
    // Evitar bucles: marcamos que estamos actualizando desde JSON
    isSyncingFromJSON = true;
    // Determinar el target apropiado: Global si no hay workspace, Workspace si existe
    const target = vscode.workspace.workspaceFolders ? vscode.ConfigurationTarget.Workspace : vscode.ConfigurationTarget.Global;

    // Actualizar archivos ignore
    await config.update('ignoreFiles', jsonConfig.ignoreFiles, target);

    // Actualizar comportamiento por defecto
    if (jsonConfig.defaultBehavior) {
      await config.update('showSelectionMenu', jsonConfig.defaultBehavior.showSelectionMenu, target);
      await config.update('allowMultipleSelection', jsonConfig.defaultBehavior.allowMultipleSelection, target);
      await config.update('createDirectories', jsonConfig.defaultBehavior.createDirectories, target);
      await config.update('showConfirmation', jsonConfig.defaultBehavior.showConfirmation, target);
    }

    console.log('VS Code Settings actualizados correctamente en', target === vscode.ConfigurationTarget.Global ? 'User Settings' : 'Workspace Settings');
  } catch (error) {
    console.error('Error actualizando VS Code Settings:', error);
    vscode.window.showErrorMessage('Error actualizando configuración: ' + error.message);
  } finally {
    isSyncingFromJSON = false;
  }
}

/**
 * Actualiza el archivo JSON con la configuración de VS Code Settings
 * @param {string} configPath - Ruta del archivo de configuración JSON
 */
async function updateJSONFromSettings(configPath) {
  try {
    // Evitar bucles: marcamos que estamos actualizando JSON desde Settings
    isSyncingToJSON = true;
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
  } finally {
    isSyncingToJSON = false;
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
  console.log('Registrando listener de configuración para:', configPath);
  return vscode.workspace.onDidChangeConfiguration(async (event) => {
    console.log('Evento de cambio de configuración detectado');
    // Solo reaccionar a cambios en nuestra configuración
    if (event.affectsConfiguration('ai-ignore')) {
      if (isSyncingFromJSON) {
        console.log('Cambio en Settings originado por sincronización desde JSON. Se omite para evitar bucle.');
        return;
      }
      console.log('Configuración AI Ignore cambió, sincronizando desde VS Code Settings al JSON...');
      try {
        await updateJSONFromSettings(configPath);
        console.log('Sincronización completada exitosamente');
      } catch (error) {
        console.error('Error durante la sincronización automática:', error);
      }
    } else {
      console.log('Cambio de configuración no relacionado con ai-ignore');
    }
  });
}

/**
 * Inicializa la sincronización bidireccional
 * @param {string} configPath - Ruta del archivo de configuración JSON
 */
async function initializeSync(configPath) {
  try {
    // Crear watcher para sincronización automática JSON -> Settings
    try {
      const configDir = path.dirname(configPath);
      const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(configDir, 'ignore-files-config.json'));

      const handleChange = async () => {
        try {
          if (isSyncingToJSON) {
            console.log('Cambio en JSON originado por sincronización desde Settings. Se omite para evitar bucle.');
            return;
          }
          const jsonContent = await fs.readFile(configPath, 'utf8');
          const jsonConfig = JSON.parse(jsonContent);
          await updateVSCodeSettings(jsonConfig);
          console.log('Sincronización automática JSON -> Settings aplicada');
        } catch (e) {
          console.error('Error en sincronización automática JSON -> Settings:', e);
        }
      };

      watcher.onDidChange(handleChange);
      watcher.onDidCreate(handleChange);
      watcher.onDidDelete(async () => {
        console.log('Archivo JSON eliminado, sin cambios en Settings');
      });
    } catch (watchErr) {
      console.error('No se pudo crear el watcher para JSON:', watchErr);
    }

    // Verificar si el archivo JSON existe y tiene más configuraciones que VS Code Settings
    let shouldSyncFromJSON = false;

    try {
      const jsonContent = await fs.readFile(configPath, 'utf8');
      const jsonConfig = JSON.parse(jsonContent);
      const vsCodeConfig = getVSCodeConfig();

      // Si el JSON tiene más archivos ignore que VS Code Settings, sincronizar desde JSON
      if (jsonConfig.ignoreFiles && jsonConfig.ignoreFiles.length > vsCodeConfig.ignoreFiles.length) {
        shouldSyncFromJSON = true;
        console.log(`JSON tiene ${jsonConfig.ignoreFiles.length} archivos, VS Code Settings tiene ${vsCodeConfig.ignoreFiles.length}`);
      }
    } catch (error) {
      console.log('No se pudo leer el archivo JSON o VS Code Settings, usando configuración por defecto');
    }

    if (shouldSyncFromJSON) {
      // Sincronizar desde JSON a VS Code Settings si JSON tiene más configuraciones
      console.log('Inicializando sincronización: JSON -> VS Code Settings');
      await syncFromJSON(configPath);
    } else {
      // Sincronizar desde VS Code Settings al JSON (comportamiento anterior)
      console.log('Inicializando sincronización: VS Code Settings -> JSON');
      await updateJSONFromSettings(configPath);
    }

    console.log('Sincronización inicial completada');

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