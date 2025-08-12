const vscode = require('vscode');
const configManager = require('./config_manager');

async function addRule() {
  try {
    // Obtener configuración actual (desde VS Code Settings)
    const currentConfig = configManager.loadConfig();
    if (!currentConfig) {
      return;
    }

    // Solicitar datos al usuario
    const name = await vscode.window.showInputBox({
      prompt: 'Nombre descriptivo (name)',
      placeHolder: 'Ej: Cursor Ignore',
      ignoreFocusOut: true,
      validateInput: (v) => (v && v.trim().length > 0 ? null : 'El nombre es obligatorio')
    });
    if (!name) return;

    const path = await vscode.window.showInputBox({
      prompt: 'Ruta relativa del archivo ignore (path)',
      placeHolder: 'Ej: .cursorignore o .trae/.ignore',
      ignoreFocusOut: true,
      validateInput: (v) => (v && v.trim().length > 0 ? null : 'La ruta es obligatoria')
    });
    if (!path) return;

    const description = await vscode.window.showInputBox({
      prompt: 'Descripción (description)',
      placeHolder: 'Ej: Archivo ignore para Cursor',
      ignoreFocusOut: true
    });

    const createIfNotExistsPick = await vscode.window.showQuickPick(['true', 'false'], {
      placeHolder: 'Crear el archivo si no existe (createIfNotExists)'
    });
    if (!createIfNotExistsPick) return;

    const enabledPick = await vscode.window.showQuickPick(['true', 'false'], {
      placeHolder: 'Habilitar este archivo ignore (enabled)'
    });
    if (!enabledPick) return;

    const createIfNotExists = createIfNotExistsPick === 'true';
    const enabled = enabledPick === 'true';

    // Evitar duplicados por path
    const exists = currentConfig.ignoreFiles.some((f) => f.path === path);
    if (exists) {
      vscode.window.showWarningMessage(`Ya existe una regla con path: ${path}`);
      return;
    }

    const newRule = {
      name,
      path,
      description: description || '',
      createIfNotExists,
      enabled
    };

    const newConfig = {
      ...currentConfig,
      ignoreFiles: [...currentConfig.ignoreFiles, newRule]
    };

    const ok = await configManager.saveConfig(newConfig);
    if (ok) {
      vscode.window.showInformationMessage('Regla añadida correctamente.');
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error añadiendo la regla: ${error.message}`);
  }
}

module.exports = addRule;


