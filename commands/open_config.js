const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

async function openConfig(configPath) {
    try {
        if (!configPath) {
            throw new Error('Config path not provided');
        }

        // Verificar si el archivo existe
        if (!fs.existsSync(configPath)) {
            // El archivo debería haber sido creado por initializeSync en extension.js
            // pero por si acaso lo creamos aquí si no existe.
            const configDir = path.dirname(configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            // Si llegamos aquí y no existe, es mejor no crear uno vacío sin estructura
            // pero para mantener compatibilidad con el código anterior:
            vscode.window.showWarningMessage('El archivo de configuración no se encontró en la ruta esperada.');
            return;
        }

        // Abrir el archivo de configuración
        const doc = await vscode.workspace.openTextDocument(configPath);
        await vscode.window.showTextDocument(doc);
    } catch (error) {
        vscode.window.showErrorMessage(`Error al abrir el archivo de configuración: ${error.message}`);
    }
}

module.exports = openConfig;
