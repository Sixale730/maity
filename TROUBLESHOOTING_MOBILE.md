# Troubleshooting: Compilación App Móvil Post-Monorepo

**Fecha**: 2025-10-20
**Problema Inicial**: Error "runtime not ready type error: cannot call a class as a function"
**Causa Raíz**: Refactorización a monorepo (commit 3a87b26) rompió la compilación de Android

---

## 📋 Resumen del Problema

Después de migrar a estructura monorepo, la app móvil no compila. El último commit funcional fue `525146a` (feat: implement backend OPUS decoding for Omi audio).

### Errores Encontrados

1. **Error TypeScript/Runtime** (RESUELTO): "cannot call a class as a function"
   - Causa: Paquete `@maity/shared` exportaba TypeScript sin compilar
   - Solución: Configurar Metro para transpilar TypeScript directamente

2. **Error CMake/Codegen** (ACTUAL): Directorios de codegen no existen
   ```
   CMake Error: add_subdirectory given source
   "C:/maity/packages/mobile/node_modules/@react-native-async-storage/async-storage/android/build/generated/source/codegen/jni/"
   which is not an existing directory.
   ```

---

## ✅ Cambios Realizados

### 1. Configuración del Monorepo (Revertida a TypeScript Directo)

#### `packages/shared/package.json`
```json
{
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

#### `packages/shared/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"]
  }
}
```

#### `packages/mobile/tsconfig.json`
```json
{
  "compilerOptions": {
    "paths": {
      "@maity/shared": ["../shared/src"]
    }
  }
}
```

#### `packages/mobile/metro.config.js`
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.projectRoot = projectRoot;
config.watchFolders = [
  workspaceRoot,
  path.resolve(workspaceRoot, 'packages/shared'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;
```

#### `packages/mobile/babel.config.js`
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

### 2. Limpieza Realizada

- ✅ Eliminado `packages/shared/dist/`
- ✅ Eliminado `packages/mobile/node_modules/`
- ✅ Eliminado `packages/mobile/.expo/`
- ✅ Reinstalado dependencias: `npm install`
- ✅ Ejecutado `npx expo prebuild --clean`

---

## ❌ Intentos que NO Funcionaron

### Intento 1: Compilar @maity/shared a CommonJS
- **Resultado**: Mismo error, Metro no procesaba correctamente las clases compiladas
- **Revertido**: Sí

### Intento 2: ./gradlew clean
- **Resultado**: Error de CMake por directorios de codegen faltantes
- **Problema**: `clean` elimina archivos que deben generarse primero

### Intento 3: npx expo prebuild --clean
- **Estado**: Ejecutado, pero compilación aún falla
- **Resultado**: Pendiente verificación

---

## 🎯 Próximos Pasos a Probar

### Opción A: Deshabilitar New Architecture

**Razón**: La New Architecture de React Native puede tener problemas con monorepos en Windows.

**Pasos**:
1. Editar `packages/mobile/app.json`:
   ```json
   {
     "expo": {
       "newArchEnabled": false
     }
   }
   ```

2. Limpiar y reconstruir:
   ```bash
   cd packages/mobile
   rm -rf android ios .expo
   npx expo prebuild --clean
   npx expo run:android --device
   ```

### Opción B: Verificar Dependencias Nativas

**Problema Potencial**: Algunas dependencias nativas pueden no ser compatibles con monorepo.

**Pasos**:
1. Verificar que todas las dependencias soporten React Native 0.79.5:
   - `@livekit/react-native@^2.9.0`
   - `react-native-ble-plx@^3.5.0`
   - `react-native-reanimated@~3.17.4`
   - `@shopify/react-native-skia@^2.3.0`

2. Revisar si alguna requiere configuración especial para monorepos

### Opción C: Configurar Gradle para Monorepo

**Razón**: Puede que Gradle no esté encontrando correctamente las dependencias en monorepo.

**Pasos**:
1. Editar `packages/mobile/android/settings.gradle`:
   ```gradle
   // Agregar al final
   rootProject.name = 'Maity'

   // Asegurar que encuentre node_modules correctamente
   apply from: new File(["node", "--print", "require.resolve('expo/package.json')"].execute(null, rootDir).text.trim(), "../scripts/autolinking.gradle");
   useExpoModules()
   ```

2. Editar `packages/mobile/android/gradle.properties`:
   ```properties
   # Deshabilitar New Architecture temporalmente
   newArchEnabled=false
   hermesEnabled=true
   ```

### Opción D: Crear Symlinks para node_modules

**Razón**: Metro puede estar buscando dependencias en ubicaciones incorrectas.

**Pasos** (requiere permisos de administrador):
```bash
cd packages/mobile
mklink /J node_modules\@maity ..\..\node_modules\@maity
```

### Opción E: Mover App Móvil Fuera del Monorepo (Plan B)

**Solo si todo lo demás falla**:

1. Crear nuevo proyecto Expo independiente:
   ```bash
   cd C:\
   npx create-expo-app maity-mobile
   cd maity-mobile
   ```

2. Copiar `packages/mobile/src` al nuevo proyecto

3. Publicar `@maity/shared` como paquete local:
   ```bash
   cd C:\maity\packages\shared
   npm pack
   # Esto genera @maity-shared-1.0.0.tgz
   ```

4. Instalar en el nuevo proyecto:
   ```bash
   cd C:\maity-mobile
   npm install C:\maity\packages\shared\maity-shared-1.0.0.tgz
   ```

---

## 🔍 Información Adicional Necesaria

Para diagnosticar mejor el problema, sería útil:

1. **Log completo de la compilación**:
   ```bash
   cd packages/mobile
   npx expo run:android --device 2>&1 | tee compile.log
   ```

2. **Verificar estructura de node_modules**:
   ```bash
   ls -la packages/mobile/node_modules/@maity/
   ```

3. **Verificar que Metro vea los archivos correctos**:
   ```bash
   npx expo start --clear
   # Revisar si el bundler detecta cambios en packages/shared
   ```

4. **Verificar si el problema es específico de Windows**:
   - ¿Funciona en otro sistema operativo?
   - ¿Hay problemas con rutas largas de Windows?

---

## 📝 Notas de Configuración Actual

### Estructura del Proyecto
```
C:\maity\
├── packages/
│   ├── mobile/           # App React Native (Expo 53, RN 0.79.5)
│   │   ├── android/
│   │   ├── src/
│   │   ├── App.tsx
│   │   ├── package.json  # @maity/shared como "file:../shared"
│   │   ├── metro.config.js
│   │   └── babel.config.js
│   └── shared/           # Código compartido TypeScript
│       ├── src/
│       │   ├── domain/   # Services, types, hooks
│       │   └── index.ts
│       └── package.json  # main: "src/index.ts"
├── package.json          # Workspace root
└── node_modules/
```

### Versiones Clave
- **Node**: (verificar con `node --version`)
- **npm**: (verificar con `npm --version`)
- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **React**: 19.0.0
- **TypeScript**: ~5.8.3
- **New Architecture**: Habilitada (`newArchEnabled: true`)

---

## ⚠️ Consideraciones Importantes

1. **New Architecture es experimental**: Puede tener issues con:
   - Monorepos
   - Windows
   - Algunas dependencias nativas

2. **React Native 0.79 + React 19**: Combinación muy reciente, puede haber incompatibilidades

3. **Expo 53**: Versión reciente, algunos plugins pueden no estar actualizados

---

## 🎯 Recomendación Inmediata

**PRIORIDAD 1**: Deshabilitar New Architecture (Opción A)
- Es la causa más probable del error de CMake
- Es un cambio reversible
- Muchos monorepos tienen problemas con New Architecture

**PRIORIDAD 2**: Si Opción A falla, verificar dependencias (Opción B)
- Algunas dependencias nativas pueden requerir configuración especial

**PRIORIDAD 3**: Si todo falla, considerar Opción E (separar mobile del monorepo)
- Es el plan B definitivo
- Garantiza que funcione como antes del commit 3a87b26

---

## 📞 Para Continuar

Ejecuta estos comandos y comparte el resultado:

```bash
# 1. Deshabilitar New Architecture
cd packages/mobile
# Editar app.json: "newArchEnabled": false

# 2. Limpiar todo
rm -rf android ios .expo node_modules
npm install

# 3. Regenerar archivos nativos
npx expo prebuild --clean

# 4. Intentar compilar
npx expo run:android --device 2>&1 | tee compile.log
```

Si sigue fallando, comparte:
- El archivo `compile.log` completo
- Resultado de: `node --version` y `npm --version`
- ¿Funciona en otro commit específico? (hacer `git checkout 525146a` y probar)
