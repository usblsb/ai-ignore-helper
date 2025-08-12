const vscode = require('vscode');
const configManager = require('./config_manager');

async function removeRule() {
  try {
    const currentConfig = configManager.loadConfig();
    if (!currentConfig) return;

    if (!currentConfig.ignoreFiles || currentConfig.ignoreFiles.length === 0) {
      vscode.window.showInformationMessage('No hay reglas para eliminar.');
      return;
    }

    const items = currentConfig.ignoreFiles.map((f) => ({
      label: f.name,
      description: f.path,
      detail: f.description || '',
      rule: f
    }));

    const picked = await vscode.window.showQuickPick(items, {
      placeHolder: 'Selecciona la regla a eliminar',
      canPickMany: false
    });
    if (!picked) return;

    const confirm = await vscode.window.showInformationMessage(
      `¿Eliminar la regla "${picked.rule.name}" (${picked.rule.path})?`,
      { modal: true },
      'Sí',
      'No'
    );
    if (confirm !== 'Sí') return;

    const newConfig = {
      ...currentConfig,
      ignoreFiles: currentConfig.ignoreFiles.filter((r) => r.path !== picked.rule.path)
    };

    const ok = await configManager.saveConfig(newConfig);
    if (ok) {
      vscode.window.showInformationMessage('Regla eliminada.');
    }
  } catch (error) {
    vscode.window.showErrorMessage(`Error eliminando la regla: ${error.message}`);
  }
}

module.exports = removeRule;


