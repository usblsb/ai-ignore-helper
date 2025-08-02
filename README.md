# AI Ignore Helper

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Una extensión configurable para Visual Studio Code que permite añadir archivos y carpetas a múltiples tipos de archivos `.ignore` de forma rápida y sencilla.

---

## Tabla de Contenidos

- ✨ Características Principales
- 🚀 Instalación
- 💻 Uso
- ⚙️ Configuración
- 🛠️ Tecnologías Utilizadas
- 🤝 Cómo Contribuir
- 👤 Autor
- 📄 Licencia

---

## ✨ Características Principales

-   **Añadir a múltiples archivos ignore:** Permite agregar una carpeta o archivo a varios archivos `.ignore` (como `.dockerignore`, `.npmignore`, `.trae/.ignore`, etc.) de una sola vez.
-   **Menú contextual:** Se integra con el menú del explorador de archivos de VS Code (clic derecho sobre un archivo o carpeta).
-   **Selección múltiple de archivos:** Soporta correctamente la selección múltiple de archivos desde el explorador, procesando todos los archivos seleccionados en una sola operación.
-   **Altamente configurable:** Los usuarios pueden definir sus propios archivos `ignore` a través de un archivo `JSON` de configuración.
-   **Creación automática:** Puede crear los archivos `ignore` y sus directorios si no existen.
-   **Selección de archivos ignore:** Permite elegir a qué archivos `ignore` específicos se quiere añadir la ruta.

## 🚀 Instalación

### Instalación desde VSIX (Recomendado)

1.  Descarga el archivo `ai-ignore-helper-1.1.11.vsix` desde el repositorio.
2.  Abre **Visual Studio Code**.
3.  Ve a la vista de **Extensiones** (puedes usar el atajo `Ctrl+Shift+X`).
4.  Haz clic en el menú de tres puntos (...) y selecciona **"Install from VSIX..."**.
5.  Selecciona el archivo `.vsix` descargado.

### Instalación desde Marketplace (Futuro)

1.  Abre **Visual Studio Code**.
2.  Ve a la vista de **Extensiones** (puedes usar el atajo `Ctrl+Shift+X`).
3.  Busca `AI Ignore Helper`.
4.  Haz clic en **Instalar**.

## 💻 Uso

### Activación Inicial

1.  Una vez instalada, activa la extensión abriendo la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`) y ejecutando `Activate AI Ignore Helper`.
2.  Esto creará la configuración inicial y los archivos ignore necesarios.

### Añadir Archivos Individuales

1.  Haz clic derecho sobre un archivo o carpeta en el explorador de archivos.
2.  Selecciona la opción **"Add to ignore files"** en el menú contextual.
3.  Se mostrará una lista con los archivos `ignore` que tienes configurados. Selecciona a cuál o cuáles quieres añadir la ruta.
4.  ¡Listo! La ruta se añadirá automáticamente a los archivos seleccionados.

### Añadir Múltiples Archivos

1.  **Selecciona múltiples archivos** en el explorador manteniendo `Ctrl` (o `Cmd` en Mac) mientras haces clic en cada archivo.
2.  Haz clic derecho sobre cualquiera de los archivos seleccionados.
3.  Selecciona **"Add to ignore files"** en el menú contextual.
4.  La extensión procesará automáticamente **todos los archivos seleccionados** y los añadirá a los archivos ignore elegidos.

### Comandos Disponibles

- `Activate AI Ignore Helper`: Activa la extensión y crea la configuración inicial.
- `Open AI Ignore Helper Configuration`: Abre el archivo de configuración para editarlo.

## ⚙️ Configuración

La extensión utiliza la **configuración nativa de VS Code** para gestionar sus ajustes. Puedes acceder a la configuración de dos formas:

### 1. Configuración desde VS Code Settings (Recomendado)

1. Abre VS Code Settings (`Ctrl+,` o `Cmd+,`)
2. Busca "AI Ignore" en la barra de búsqueda
3. Configura los archivos ignore y comportamientos desde la interfaz gráfica

### 2. Configuración desde settings.json

También puedes editar directamente el archivo `settings.json` de tu workspace:

```json
{
  "ai-ignore.ignoreFiles": [
    {
      "name": "Trae Ignore",
      "path": ".trae/.ignore",
      "description": "Archivo ignore para Trae AI",
      "createIfNotExists": true,
      "enabled": true
    },
    {
      "name": "Docker Ignore",
      "path": ".dockerignore",
      "description": "Archivo ignore para Docker",
      "createIfNotExists": true,
      "enabled": true
    },
    {
      "name": "NPM Ignore",
      "path": ".npmignore",
      "description": "Archivo ignore para NPM",
      "createIfNotExists": true,
      "enabled": true
    }
  ],
  "ai-ignore.showSelectionMenu": true,
  "ai-ignore.allowMultipleSelection": true,
  "ai-ignore.createDirectories": true,
  "ai-ignore.showConfirmation": true
}
```

### 3. Sincronización con archivo JSON (Legacy)

La extensión mantiene compatibilidad con el archivo `config/ignore-files-config.json` y proporciona comandos para sincronizar entre ambos formatos:

- **AI Ignore: Sync from JSON to Settings** - Importa configuración desde el archivo JSON
- **AI Ignore: Sync from Settings to JSON** - Exporta configuración actual a archivo JSON

## 🛠️ Tecnologías Utilizadas

-   **JavaScript**
-   **Node.js**
-   **Visual Studio Code API**

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar este proyecto, por favor sigue estos pasos:

1.  Haz un **Fork** de este repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`).
3.  Realiza tus cambios y haz **Commit** (`git commit -m 'Añade una nueva característica'`).
4.  Haz **Push** a tu rama (`git push origin feature/nueva-caracteristica`).
5.  Abre un **Pull Request**.

## 🔧 Notas Técnicas

### Configuración Integrada con VS Code

- **Configuración nativa**: La extensión utiliza el sistema de configuración nativo de VS Code (`contributes.configuration`)
- **Sincronización automática**: Los cambios en VS Code Settings se reflejan automáticamente en la extensión
- **Compatibilidad**: Mantiene retrocompatibilidad con el archivo JSON legacy
- **Acceso programático**: La configuración se accede mediante `vscode.workspace.getConfiguration('ai-ignore')`

### Manejo de Selección Múltiple

La extensión implementa correctamente el manejo de selecciones múltiples siguiendo las mejores prácticas de VS Code:

- **Parámetros del comando**: Recibe `contextSelection` (archivo clicado) y `allSelections` (array de todos los seleccionados)
- **Priorización inteligente**: Procesa `allSelections` cuando está disponible, o `contextSelection` para archivos individuales
- **Compatibilidad total**: Funciona tanto con selecciones individuales como múltiples sin configuración adicional

### Comandos de Sincronización

- **`ai-ignore.syncFromJSON`**: Importa configuración desde `config/ignore-files-config.json` a VS Code Settings
- **`ai-ignore.syncToJSON`**: Exporta configuración actual de VS Code Settings al archivo JSON
- **Sincronización automática**: Al guardar configuración, se actualiza automáticamente el archivo JSON

### Solución de Problemas

#### La configuración no se sincroniza automáticamente

**Problema**: Los cambios en VS Code Settings no se reflejan automáticamente en el menú "Add to ignore files".

**Soluciones implementadas en v1.2.3**:
- **Activación automática**: La extensión se activa al iniciar VS Code para registrar el listener de configuración
- **Detección inteligente de scope**: Maneja correctamente User Settings y Workspace Settings
- **Logs de depuración**: Permite identificar problemas de sincronización

**Si persiste el problema**:
1. **Verifica el scope**: Asegúrate de editar en el mismo scope (User vs Workspace Settings)
2. **Recarga la ventana**: Ejecuta "Developer: Reload Window" desde la paleta de comandos
3. **Sincronización manual**: Ejecuta `AI Ignore: Sync from JSON` desde la paleta de comandos
4. **Revisa los logs**: Abre la consola de desarrollador para ver los logs de sincronización

#### Verificar que la sincronización funciona

1. Abre la consola de desarrollador (Help > Toggle Developer Tools)
2. Ve a la pestaña "Console"
3. Edita la configuración de `ai-ignore` en Settings
4. Deberías ver logs como:
   - "Evento de cambio de configuración detectado"
   - "Configuración AI Ignore cambió, sincronizando..."
   - "Sincronización completada exitosamente"

### Versiones

- **Versión actual**: 2.0.6
- **Última mejora**: Icono visual añadido a la extensión
- **Compatibilidad**: VS Code 1.60.0 y superior

#### Historial de Versiones

**v2.0.6**
- **Icono visual**: Añadido icono oficial a la extensión para mejor identificación en el marketplace y panel de extensiones de VS Code.
- **Mejora de UX**: La extensión ahora es más fácil de identificar visualmente entre otras extensiones instaladas.
- **Recursos gráficos**: Incluye archivos de icono en formato PNG y SVG en la carpeta `/images`.

**v2.0.4**
- **Configuración extendida**: Añadidos 11 nuevos tipos de archivos ignore (ESLint, Prettier, Sourcegraph, Jest, Webpack, Babel, Stylelint, Markdownlint, TypeScript, Roocode, Cline) para un total de 15 archivos ignore soportados.
- **Sincronización inteligente bidireccional**: La extensión ahora detecta automáticamente cuál fuente (VS Code Settings o archivo JSON) tiene más configuraciones y sincroniza desde la fuente más completa.
- **Detección automática de configuración**: Al inicializar, la extensión compara el número de archivos ignore en ambas fuentes y prioriza la que tenga más elementos configurados.
- **Compatibilidad mejorada**: Mantiene retrocompatibilidad total con configuraciones existentes mientras permite expansión automática.

**v1.2.3**
- **Activación automática**: La extensión ahora se activa automáticamente al iniciar VS Code (usando `"*"` en activationEvents) para garantizar que el listener de configuración se registre correctamente.
- **Sincronización inteligente**: Mejorada la detección del scope de configuración (User Settings vs Workspace Settings) para una sincronización más precisa.
- **Logs de depuración**: Añadidos logs detallados para facilitar la identificación de problemas de sincronización.
- **Compatibilidad mejorada**: La extensión ahora maneja correctamente tanto User Settings como Workspace Settings según el contexto.

**v1.2.0**
- **Sincronización mejorada**: Se corrigió el problema donde la configuración "GIT Ignore" no aparecía en el menú desplegable. La extensión ahora sincroniza correctamente entre VS Code Settings y el archivo JSON local.
- **Comando de sincronización**: Se añadió el comando `AI Ignore: Sync from JSON` para forzar la sincronización manual cuando sea necesario.

### Limitaciones Conocidas

- Rendimiento: Se recomienda no procesar más de 100 archivos simultáneamente
- Rutas: Puede tener problemas con caracteres especiales en algunos sistemas
- Ubicación: Solo funciona con archivos dentro del workspace actual
- La sincronización JSON es unidireccional (requiere comandos manuales)

## 👤 Autor

-   **Juan Luis Martel Revuelta** - @usblsb

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE.md` para más detalles.
