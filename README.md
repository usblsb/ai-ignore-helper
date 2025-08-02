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

-   **Añadir a múltiples archivos ignore:** Permite agregar una carpeta o archivo a varios archivos `.ignore` (como `.dockerignore`, `.npmignore`, etc.) de una sola vez.
-   **Menú contextual:** Se integra con el menú del explorador de archivos de VS Code (clic derecho sobre un archivo o carpeta).
-   **Altamente configurable:** Los usuarios pueden definir sus propios archivos `ignore` a través de un archivo `JSON` de configuración.
-   **Creación automática:** Puede crear los archivos `ignore` y sus directorios si no existen.
-   **Selección múltiple:** Permite elegir a qué archivos `ignore` específicos se quiere añadir la ruta.

## 🚀 Instalación

1.  Abre **Visual Studio Code**.
2.  Ve a la vista de **Extensiones** (puedes usar el atajo `Ctrl+Shift+X`).
3.  Busca `AI Ignore Helper`.
4.  Haz clic en **Instalar**.

## 💻 Uso

1.  Una vez instalada, la extensión se activará automáticamente. Si no lo hace, puedes abrir la paleta de comandos (`Ctrl+Shift+P`) y ejecutar `Activate AI Ignore Helper`.
2.  Para añadir un archivo o carpeta a un archivo `.ignore`, haz clic derecho sobre él en el explorador de archivos.
3.  Selecciona la opción **"Add to ignore files"** en el menú contextual.
4.  Se mostrará una lista con los archivos `ignore` que tienes configurados. Selecciona a cuál o cuáles quieres añadir la ruta.
5.  ¡Listo! La ruta se añadirá automáticamente a los archivos seleccionados.

## ⚙️ Configuración

Puedes personalizar los archivos `ignore` a los que la extensión debe apuntar. Al activar la extensión por primera vez, se creará un archivo `config/ignore-files-config.json` en la raíz de tu proyecto.

Puedes editar este archivo para añadir, modificar o eliminar los archivos `ignore` que desees.

**Ejemplo de `ignore-files-config.json`:**

```json
{
  "ignoreFiles": [
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
  "defaultBehavior": {
    "showSelectionMenu": true,
    "allowMultipleSelection": true,
    "createDirectories": true,
    "showConfirmation": true
  }
}
```

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

## 👤 Autor

-   **Juan Luis Martel Revuelta** - @usblsb

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE.md` para más detalles.
