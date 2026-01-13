# Changelog

## [4.0.0] - 2026-01-13

### Added
- **Panel "Add Ignore"**: Nuevo panel lateral en la barra de actividad con icono "+" para gestionar plantillas de archivos ignore.
- **Operaciones CRUD**: Crear, editar y eliminar plantillas directamente desde el panel lateral.
- **TreeView**: Vista de árbol que muestra todas las plantillas configuradas con iconos y descripciones.
- **Comandos nuevos**:
  - `ai-ignore.addEntry`: Añadir nueva plantilla
  - `ai-ignore.editEntry`: Editar plantilla existente
  - `ai-ignore.deleteEntry`: Eliminar plantilla (con confirmación)
  - `ai-ignore.refreshView`: Refrescar la vista del panel

### Changed
- **Migración a TypeScript**: Todo el código fuente migrado a TypeScript con tipado estricto.
- **Estructura de proyecto**: Código fuente reorganizado en `src/` con compilación a `out/`.
- **Mejoras de código**: Todas las funciones ahora usan el prefijo `jl_` según convención.

### Technical
- Nuevo `tsconfig.json` con modo estricto habilitado.
- Scripts de compilación: `compile`, `watch`, `vscode:prepublish`.
- Dependencias de desarrollo: `typescript`, `@types/vscode`, `@types/node`.

---

## [3.0.4]

- **Zero Pollution**: La extensión ya no crea automáticamente carpetas `.vscode` ni `config` en el workspace.
- **Global Storage**: La configuración ahora se almacena en el almacenamiento global de VS Code.
- **Mejora**: Saneamiento de rutas y eliminación de archivos obsoletos (`write-settings.js`).

## [3.0.3] - 2026-01-12
- Añadido soporte para menú contextual en la vista de control de versiones (SCM). Ahora puedes añadir archivos a ignorar directamente desde la lista de cambios.
