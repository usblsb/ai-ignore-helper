# Resumen de la Extensión "AI Ignore Helper"

# AI Ignore Helper - Project Rules

## Estructura del Proyecto

```
ai-ignore-helper/
├── package.json                    # Configuración de la extensión
├── extension.js                    # Punto de entrada principal
├── config/
│   └── ignore-files-config.json    # Configuración de archivos ignore
├── commands/
│   ├── activate.js                 # Comando de activación
│   ├── add_to_gitignore.js         # Lógica de añadir archivos
│   ├── config_manager.js           # Gestión de configuración
│   ├── file_creator.js             # Creación automática de archivos
│   ├── ignore_handler.js           # Manejo de archivos ignore
│   └── open_config.js              # Apertura de configuración
├── controllers/
│   ├── toggle-adding.js            # Control de contexto de menús
│   └── write-settings.js           # Escritura de configuración VSCode
└── docs/
    ├── documentacion-ai-ignore-helper.md
    ├── lista-tareas-ai-ignore-helper.md
    └── viabilidad-ai-ignore-helper.md
```

## Convenciones de Codificación

### 1. Estilo de Código

- Usar JavaScript moderno (ES6+)
- Indentación: 2 espacios
- Comillas: Simples para cadenas, dobles para JSON
- Punto y coma al final de las sentencias
- Nombres de variables y funciones en camelCase
- Constantes en UPPER_SNAKE_CASE

### 2. Estructura de Archivos

- Cada archivo debe tener una única responsabilidad
- Exportar funciones usando `module.exports`
- Importar módulos usando `require`
- Usar comentarios JSDoc para documentar funciones

### 3. Manejo de Errores

- Todas las operaciones asíncronas deben estar dentro de bloques try-catch
- Proporcionar mensajes de error descriptivos
- Registrar errores en la consola para depuración
- Mostrar mensajes amigables al usuario

### 4. Procesamiento de Archivos

- Usar `fs.promises` para operaciones de archivo
- Normalizar rutas usando `path` y reemplazar barras invertidas
- Verificar existencia de archivos antes de operar
- Crear directorios automáticamente cuando sea necesario

## Flujo de Trabajo

### 1. Activación de la Extensión

1. El usuario ejecuta el comando `Activate AI Ignore Helper`
2. Se crea el directorio `config/` si no existe
3. Se crea el archivo `config/ignore-files-config.json` con configuración por defecto
4. Se crean los archivos ignore configurados si no existen
5. Se actualiza el archivo `.vscode/settings.json`

### 2. Añadir Archivos a Ignore

1. El usuario selecciona uno o más archivos/carpetas en el explorador
2. Hace clic derecho y selecciona "Add to ignore files"
3. Se muestra un menú de selección de archivos ignore (si está configurado)
4. Se muestra una confirmación (si está configurado)
5. Para cada archivo ignore:
   - Se verifica si existe, si no, se crea
   - Se lee el contenido actual
   - Se procesan todos los recursos seleccionados
   - Se reconstruye el archivo con las entradas existentes y nuevas
   - Se eliminan duplicados manteniendo el orden

### 3. Configuración

- El usuario puede ejecutar `Open AI Ignore Helper Configuration`
- Se abre el archivo `config/ignore-files-config.json`
- El usuario puede añadir/editar/eliminar archivos ignore
- Los cambios se aplican después de recargar VS Code

## Pruebas

### 1. Pruebas Manuales

- Probar activación inicial
- Probar añadir archivos individuales
- Probar añadir múltiples archivos
- Probar con archivos ignore que no existen
- Probar con archivos ignore existentes
- Probar con archivos duplicados

### 2. Casos de Prueba

- Creación automática de directorios y archivos
- Detección correcta de duplicados
- Procesamiento de múltiples archivos
- Manejo de errores en diferentes escenarios
- Actualización correcta de archivos ignore

## Contribuciones

### 1. Proceso de Contribución

1. Hacer fork del repositorio
2. Crear una rama para la nueva funcionalidad
3. Seguir las convenciones de codificación
4. Probar los cambios exhaustivamente
5. Enviar un pull request con descripción detallada

### 2. Requisitos para Pull Requests

- El código debe seguir las convenciones establecidas
- Debe incluir pruebas para la nueva funcionalidad
- La documentación debe estar actualizada
- El pull request debe resolver un issue específico

## Notas Importantes

### 1. Rendimiento

- El procesamiento de múltiples archivos puede ser lento
- Se recomienda no procesar más de 100 archivos a la vez
- Los archivos ignore muy grandes pueden afectar el rendimiento

### 2. Compatibilidad

- La extensión es compatible con VS Code 1.60.0 y superior
- Funciona en Windows, Linux y macOS
- No requiere dependencias externas

### 3. Limitaciones Conocidas

- No soporta archivos ignore en ubicaciones personalizadas fuera del workspace
- No maneja correctamente rutas con caracteres especiales en algunos sistemas
- La detección de duplicados puede fallar con rutas normalizadas diferente

### 4. Seguridad

- La extensión solo modifica archivos dentro del workspace
- No envía información a servidores externos
- No almacena información sensible

## Mantenimiento

### 1. Actualizaciones

- Las actualizaciones deben mantener compatibilidad hacia atrás
- Los cambios en la configuración deben ser documentados
- Las nuevas funcionalidades deben ser opcionales

### 2. Soporte

- Los issues deben ser reportados con detalles del entorno
- Incluir pasos para reproducir el problema
- Adjuntar capturas de pantalla cuando sea relevante

### 3. Documentación

- Mantener la documentación actualizada
- Incluir ejemplos de uso
- Documentar cambios importantes en el CHANGELOG

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

#### Propósito General

La extensión es una herramienta de ayuda para desarrolladores, diseñada para
simplificar la gestión de archivos de exclusión (conocidos como `ignore files`)
en diferentes contextos de un proyecto de software. Se usa para añadir ficheros
que los modelos LLM deben de ignorar.

#### Funcionalidades Clave Inferidas

1.  **Gestión Centralizada de Archivos `.ignore`**:

    - Soporta los archivos de exclusión más comunes como <mcfile name=".gitignore" path="/.gitignore"></mcfile> (para Git), <mcfile name=".npmignore" path="/.npmignore"></mcfile> (para npm) y <mcfile name=".dockerignore" path="/.dockerignore"></mcfile> (para Docker).
    - Incluye soporte para un archivo de configuración personalizado, <mcfile name=".ignore" path="/.trae/.ignore"></mcfile>, específico del entorno "Trae AI".

2.  **Comandos Integrados en VS Code**:

    - La carpeta <mcfolder name="commands" path="/commands"></mcfolder> contiene la lógica para diversas acciones que se pueden ejecutar desde el editor.
    - Existen comandos específicos para `activar` la funcionalidad (<mcfile name="activate.js" path="/commands/activate.js"></mcfile>), `añadir reglas` a los archivos ignore (<mcfile name="add_to_gitignore.js" path="/commands/add_to_gitignore.js"></mcfile>), y `gestionar la configuración` (<mcfile name="config_manager.js" path="/commands/config_manager.js"></mcfile> y <mcfile name="open_config.js" path="/commands/open_config.js"></mcfile>).

3.  **Configuración Personalizable**:

    - Utiliza un archivo central <mcfile name="ignore-files-config.json" path="/config/ignore-files-config.json"></mcfile> para que puedas ajustar su comportamiento según las necesidades de tu proyecto.

4.  **Control de Estado**:
    - La carpeta <mcfolder name="controllers" path="/controllers"></mcfolder> sugiere que la extensión maneja estados internos, como la capacidad de `activar o desactivar` (<mcfile name="toggle-adding.js" path="/controllers/toggle-adding.js"></mcfile>) la adición automática de reglas de exclusión.

#### Estructura y Punto de Entrada

- El archivo principal que inicializa todas estas capacidades es <mcfile name="extension.js" path="/extension.js"></mcfile>, que es el punto de entrada estándar para las extensiones de VS Code.
- La información de la extensión, como su nombre, versión y los comandos que registra en la interfaz de VS Code, se encuentra definida en el archivo <mcfile name="package.json" path="/package.json"></mcfile>.

En resumen, esta extensión actúa como un asistente para mantener los archivos
`.ignore` limpios y actualizados dentro del fichero ignore del LLM, evitando que
archivos innecesarios sean leidos por el LLM (como
dependencias, logs o archivos de compilación) se suban a tus repositorios o se
incluyan en tus paquetes de software.
