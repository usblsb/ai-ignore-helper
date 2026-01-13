# AI Ignore Helper

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
[![Author](https://img.shields.io/badge/author-usblsb-blue)](https://github.com/usblsb)

Una extensión configurable para Visual Studio Code que permite añadir archivos y carpetas a múltiples tipos de archivos `.ignore` de forma rápida y sencilla.

---

## Tabla de Contenidos

- ✨ Características Principales
- 🆕 Panel "Add Ignore" (NUEVO en v4.0)
- 🔍 Verificación de .gitignore (NUEVO en v4.1)
- 🚀 Instalación
- 💻 Uso
- ⚙️ Configuración
- 🛠️ Tecnologías Utilizadas
- 🤝 Cómo Contribuir
- 👤 Autor
- 📄 Licencia

---

## ✨ Características Principales

- **Añadir a múltiples archivos ignore:** Permite agregar una carpeta o archivo a varios archivos `.ignore` (como `.dockerignore`, `.npmignore`, `.trae/.ignore`, `.geminiignore`, etc.) de una sola vez.
- **Menú contextual:** Se integra con el menú del explorador de archivos de VS Code (clic derecho sobre un archivo o carpeta).
- **Selección múltiple de archivos:** Soporta correctamente la selección múltiple de archivos desde el explorador, procesando todos los archivos seleccionados en una sola operación.
- **Altamente configurable:** Los usuarios pueden definir sus propios archivos `ignore` a través de un archivo `JSON` de configuración global.
- **Creación automática:** Puede crear los archivos `ignore` y sus directorios si no existen.
- **Selección de archivos ignore:** Permite elegir a qué archivos `ignore` específicos se quiere añadir la ruta.

---

## 🆕 Panel "Add Ignore" (Mejorado en v4.2)

La versión 4.2 mejora significativamente el panel de gestión con un **Sistema de Tres Listas**:

### Orígenes de Templates
El panel ahora agrupa las plantillas según su origen para mejor organización:

1. 📦 **Default Templates**: Plantillas integradas en la extensión (solo lectura).
2. 🌐 **Global Templates**: Tus plantillas personalizadas. Se guardan en la configuración de usuario y se sincronizan entre máquinas si usas Settings Sync.
3. 📁 **Project Templates**: Plantillas específicas para el proyecto actual. Se guardan en un archivo `ai-ignore-templates.json` en la raíz de tu workspace, ideal para compartir configuraciones con tu equipo vía Git.

### Gestión de Templates
Al crear una nueva plantilla (`+`), ahora podrás elegir su destino:
- **Global**: Para usarla en todos tus proyectos.
- **Project**: Para que solo esté disponible en el proyecto actual.

### Operaciones CRUD
Todas las operaciones (Crear, Editar, Eliminar) ahora actualizan la vista automáticamente. Además, al crear plantillas puedes establecer su estado inicial (Enabled/Disabled).

---

## 🔍 Verificación de .gitignore (NUEVO en v4.1)

La versión 4.1 introduce una funcionalidad para **detectar y corregir incoherencias** entre tu archivo `.gitignore` y los archivos rastreados por Git.

### ¿Qué problema resuelve?

Cuando añades un archivo a `.gitignore` **después** de haberlo subido a Git, el archivo **sigue siendo rastreado**. Esto puede causar que archivos sensibles o innecesarios permanezcan en tu repositorio aunque estén en `.gitignore`.

### Cómo usar

#### Opción 1: Desde el panel lateral
1. Abre el panel **Add Ignore** en la barra de actividad.
2. Haz clic en el botón **⚠️** (icono de advertencia) en la barra de título del panel.

#### Opción 2: Desde la paleta de comandos
1. Pulsa `Cmd+Shift+P` (Mac) o `Ctrl+Shift+P` (Windows/Linux).
2. Busca **"AI Ignore: Check Gitignore Sync"**.

### Opciones disponibles

| Opción | Descripción |
|--------|-------------|
| 🔧 **Corregir todo automáticamente** | Ejecuta `git rm --cached` para cada archivo problemático. Los archivos locales **NO** se eliminan. |
| 📋 **Copiar comandos al portapapeles** | Copia los comandos para ejecutarlos manualmente. |
| 📄 **Ver archivos problemáticos** | Lista los archivos que están en `.gitignore` pero siguen siendo rastreados. |

### Flujo recomendado

1. Ejecuta la verificación periódicamente o antes de hacer push.
2. Si se detectan problemas, usa "Corregir todo automáticamente".
3. Haz commit de los cambios.
4. Ejecuta `git push` para sincronizar con el repositorio remoto.

---

## 🚀 Instalación

### Instalación desde VSIX (Recomendado)

1.  Descarga el archivo `ai-ignore-helper-4.0.0.vsix` desde el repositorio.
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

1.  Una vez instalada, la extensión se activa automáticamente al abrir VS Code.
2.  No se crean carpetas ni archivos en tu proyecto de forma automática, manteniendo tu workspace limpio.

### Añadir Archivos Individuales

1.  Haz clic derecho sobre un archivo o carpeta en el explorador de archivos.
2.  Selecciona la opción **"Add to Ignore Files and Rules"** en el menú contextual.
3.  Se mostrará una lista con los archivos `ignore` que tienes configurados. Selecciona a cuál o cuáles quieres añadir la ruta.
4.  ¡Listo! La ruta se añadirá automáticamente a los archivos seleccionados.

### Añadir Múltiples Archivos

1.  **Selecciona múltiples archivos** en el explorador manteniendo `Ctrl` (o `Cmd` en Mac) mientras haces clic en cada archivo.
2.  Haz clic derecho sobre cualquiera de los archivos seleccionados.
3.  Selecciona **"Add to Ignore Files and Rules"** en el menú contextual.
4.  La extensión procesará automáticamente **todos los archivos seleccionados** y los añadirá a los archivos ignore elegidos.

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `Activate AI Ignore Helper` | Verifica y crea los archivos ignore habilitados |
| `AI Ignore: Add Rule` | Añade una nueva regla al listado global |
| `AI Ignore: Remove Rule` | Elimina una regla existente del listado global |
| `AI Ignore: Add Template` | Añade una plantilla desde el panel lateral |
| `AI Ignore: Edit Template` | Edita una plantilla existente |
| `AI Ignore: Delete Template` | Elimina una plantilla (con confirmación) |
| `Open AI Ignore Helper Configuration` | Abre el archivo de configuración global |
| `AI Ignore: Sync from JSON to Settings` | Sincroniza desde JSON a VS Code Settings |
| `AI Ignore: Sync from Settings to JSON` | Sincroniza desde VS Code Settings a JSON |
| `AI Ignore: Check Gitignore Sync` | Detecta archivos en `.gitignore` que siguen siendo rastreados |

## ⚙️ Configuración

La extensión utiliza un sistema de almacenamiento global para evitar ensuciar tus proyectos con archivos de configuración locales.

### 1. Configuración desde VS Code Settings (Recomendado)

1. Abre VS Code Settings (`Ctrl+,` o `Cmd+,`)
2. Busca "AI Ignore" en la barra de búsqueda
3. Configura los archivos ignore y comportamientos desde la interfaz gráfica. Los cambios se aplicarán de forma global.

### 2. Configuración desde el Panel "Add Ignore"

1. Abre el panel "Add Ignore" en la barra lateral
2. Usa los botones **+** para añadir nuevas plantillas
3. Haz clic derecho en una plantilla para editarla o eliminarla

### 3. Configuración desde archivo JSON global

Puedes editar directamente el archivo de configuración JSON que se almacena en el directorio de datos de la extensión (Global Storage). Para abrirlo, usa el comando: `Open AI Ignore Helper Configuration`.

---

## 🔧 Notas Técnicas

### Limpieza de Workspace (Zero Pollution)

La extensión sigue una filosofía de **cero polución**:
- **Sin carpeta `.vscode/` automática**: No se fuerza la creación de `settings.json` en el workspace.
- **Sin carpeta `config/`**: El archivo `ignore-files-config.json` se almacena fuera del workspace del usuario.
- **Configuración Global**: Las reglas y preferencias se mantienen a nivel de usuario.

### Historial de Versiones

**v4.1.0** (Actual)
- **Verificación de .gitignore**: Detecta archivos ignorados que siguen siendo rastreados por Git.
- **Corrección automática**: Ejecuta `git rm --cached` con un clic.
- **Nuevo comando**: `checkGitignoreSync` disponible desde el panel y la paleta de comandos.

**v4.0.0**
- **Panel "Add Ignore"**: Nuevo panel lateral con operaciones CRUD completas.
- **Migración a TypeScript**: Código fuente completamente migrado con tipado estricto.
- **TreeView**: Vista de árbol para gestionar plantillas visualmente.
- **Nuevos comandos**: `addEntry`, `editEntry`, `deleteEntry`, `refreshView`.

**v3.0.4**
- **Zero Pollution Completo**: Eliminación total de dependencias de archivos locales.

**v3.0.3**
- **Refactorización de Almacenamiento**: Uso de GlobalStorageUri.

### Tecnologías Utilizadas

- **TypeScript** (v4.0+)
- **Node.js**
- **Visual Studio Code API**

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar este proyecto, por favor sigue estos pasos:

1.  Haz un **Fork** de este repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-caracteristica`).
3.  Realiza tus cambios y haz **Commit** (`git commit -m 'Añade una nueva característica'`).
4.  Haz **Push** a tu rama (`git push origin feature/nueva-caracteristica`).
5.  Abre un **Pull Request**.

## 📸 Capturas

Puedes incluir capturas en este README añadiendo imágenes a la carpeta `images/` y referenciándolas con rutas relativas:

```md
![Menú contextual](images/ejemplo-menu-contextual.png)
```

## 👤 Autor

- **Juan Luis Martel Revuelta** - [@usblsb](https://github.com/usblsb) · Web: https://usblsb.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE.md` para más detalles.