# Recursos para Avatares Voxel - Investigacion

> Fecha de investigacion: Enero 2026
> Proposito: Evaluar opciones para el sistema de avatares de Maity

## Tabla de Contenidos

- [Repositorios de Referencia](#repositorios-de-referencia)
- [Librerias npm](#librerias-npm)
- [Herramientas de Creacion](#herramientas-de-creacion)
- [Packs de Assets Gratuitos](#packs-de-assets-gratuitos)
- [Librerias de Avatares (No Voxel)](#librerias-de-avatares-no-voxel)
- [Comparacion de Enfoques](#comparacion-de-enfoques)
- [Recomendacion para Maity](#recomendacion-para-maity)

---

## Repositorios de Referencia

### 1. Expo-Crossy-Road

| Campo | Valor |
|-------|-------|
| **URL** | https://github.com/EvanBacon/Expo-Crossy-Road |
| **Autor** | Evan Bacon |
| **Licencia** | MIT |
| **Demo** | https://crossyroad.expo.app |

#### Descripcion
Clon completo del juego Crossy Road construido con Expo, React Native y THREE.js. Funciona en iOS, Android y Web.

#### Stack Tecnologico
- **THREE.js** - Motor 3D WebGL
- **GSAP** - Animaciones (Greensock Animation Platform)
- **Expo** - Framework multiplataforma
- **React Native** - Base movil
- **TypeScript** - 99.7% del codigo

#### Estructura del Proyecto
```
src/
├── Characters.ts      # Definicion de personajes
├── Models.ts          # Configuracion de modelos 3D
├── ModelLoader.ts     # Cargador de modelos
├── CrossyPlayer.ts    # Logica del jugador
├── CrossyGame.ts      # Motor principal
├── Node/              # Gestion de nodos 3D
├── Particles/         # Sistema de particulas
├── components/        # Componentes React
└── hooks/             # Hooks personalizados

assets/
├── models/            # Archivos .obj y texturas
├── audio/             # Sonidos
├── fonts/             # Tipografias
└── images/            # Graficos
```

#### Como Crean los Personajes
Los modelos se crean en **MagicaVoxel** y se exportan como archivos `.obj`:

```javascript
// Models.ts - Estructura de modelos
export default {
  characters: {
    chicken: {
      model: require("./assets/characters/chicken.obj"),
      texture: require("./assets/characters/chicken.png"),
    }
  },
  vehicles: {
    police_car: { /* ... */ },
    taxi: { /* ... */ },
  },
  environment: {
    grass: { /* variantes */ },
    tree: { /* variantes */ },
  }
}
```

```javascript
// CrossyPlayer.ts - Renderizado del personaje
export default class CrossyPlayer extends Group {
  setCharacter(character) {
    const node = ModelLoader._hero.getNode(character);
    utils.scaleLongestSideToSize(node, 1);
    utils.alignMesh(node, { x: 0.5, z: 0.5, y: 1.0 });
    this.add(node);
  }
}
```

#### Personajes Disponibles
- **chicken** (activo)
- bacon, brent, avocoder, wheeler, palmer, juwan (comentados)

#### Que Podemos Aprender
- Arquitectura de carga de modelos con ModelLoader singleton
- Uso de GSAP para animaciones fluidas (salto, idle, movimiento)
- Escalado y alineacion de meshes
- Estructura de assets organizada

---

### 2. Crossy-ComGraphics

| Campo | Valor |
|-------|-------|
| **URL** | https://github.com/hoangtan-dev/Crossy-ComGraphics |
| **Proposito** | Proyecto academico (CS105 Computer Graphics) |
| **Estilo** | Voxel Graphics con MagicaVoxel |

#### Descripcion
Remake del juego Crossy Road que adapta el estilo grafico Voxel usando MagicaVoxel para crear modelos de personajes y elementos del ambiente.

#### Stack Tecnologico
- **THREE.js** - Renderizado 3D
- **GSAP** - Animaciones
- **React Native** - Framework base
- **Expo** - Plataforma de desarrollo
- **MagicaVoxel** - Creacion de modelos

#### Estructura del Proyecto
```
/components    # Componentes React reutilizables
/screens       # Pantallas principales
/src           # Logica central
/assets        # Modelos voxelados
/context       # Estado global
```

#### Que Podemos Aprender
- Flujo de trabajo MagicaVoxel -> THREE.js
- Integracion de modelos .vox en aplicaciones web/movil

---

## Librerias npm

### 1. Three.js VOXLoader (Oficial)

| Campo | Valor |
|-------|-------|
| **Ubicacion** | `three/examples/jsm/loaders/VOXLoader.js` |
| **Formato** | .vox (MagicaVoxel nativo) |
| **Documentacion** | https://threejs.org/examples/webgl_loader_vox.html |

#### Descripcion
Loader oficial de Three.js para archivos `.vox` de MagicaVoxel. Parsea el formato binario y genera meshes optimizados.

#### Caracteristicas
- Soporta versiones VOX 150 y 200
- Convierte sistema de coordenadas (Z-up a Y-up)
- Greedy meshing para optimizacion
- Genera `MeshStandardMaterial` con vertex colors

#### Uso Basico
```javascript
import { VOXLoader } from 'three/examples/jsm/loaders/VOXLoader.js';

const loader = new VOXLoader();
loader.load('character.vox', (chunks) => {
  chunks.forEach((chunk) => {
    const mesh = chunk.buildMesh();
    scene.add(mesh);
  });
});
```

#### Metodos Principales
- `buildMesh()` - Crea mesh con MeshStandardMaterial
- `buildData3DTexture()` - Genera textura 3D para visualizacion

---

### 2. parse-magica-voxel

| Campo | Valor |
|-------|-------|
| **npm** | `npm install parse-magica-voxel` |
| **Autor** | kchapelier |
| **Proposito** | Parser de archivos .vox en JavaScript |

#### Descripcion
Libreria ligera para parsear archivos `.vox` de MagicaVoxel y convertirlos a objetos JavaScript.

#### Uso
```javascript
const parseMagicaVoxel = require('parse-magica-voxel');
const fs = require('fs');

const buffer = fs.readFileSync('model.vox');
const voxelData = parseMagicaVoxel(buffer);

// voxelData contiene:
// - size: { x, y, z }
// - voxels: [{ x, y, z, colorIndex }]
// - palette: [{ r, g, b, a }]
```

---

### 3. voxel (max-mapper)

| Campo | Valor |
|-------|-------|
| **npm** | `npm install voxel` |
| **GitHub** | https://github.com/max-mapper/voxel |
| **Autor** | Mikola Lysenko (empaquetado por Max Ogden) |
| **Licencia** | MIT |

#### Descripcion
Libreria para generacion de geometria voxel y algoritmos de meshing. Base para muchos proyectos de juegos voxel.

#### API Principal

```javascript
const voxel = require('voxel');

// Generar voxels proceduralmente
const data = voxel.generate([0,0,0], [16,16,16], (x, y, z) => {
  // Retorna color (numero) o 0 para vacio
  return y < 8 ? 0xff0000 : 0; // Mitad inferior roja
});

// Meshers disponibles
voxel.meshers.stupid   // Sin optimizacion
voxel.meshers.culled   // Elimina caras ocultas
voxel.meshers.monotone // Optimizacion monotona
voxel.meshers.greedy   // Mejor optimizacion (recomendado)

// Ejemplos pre-generados
const examples = voxel.generateExamples();
```

#### Notas
- Libreria antigua (11+ anos) pero funcional
- API de bajo nivel, requiere integracion manual con Three.js
- Base para `voxel-engine`

---

### 4. voxel-engine

| Campo | Valor |
|-------|-------|
| **npm** | `npm install voxel-engine` |
| **GitHub** | https://github.com/max-mapper/voxel-engine |
| **Dependientes** | 18 proyectos en npm |

#### Descripcion
Motor de juego voxel 3D para HTML5. Permite crear mundos tipo Minecraft en el navegador.

#### Uso Basico
```javascript
const voxelEngine = require('voxel-engine');

const game = voxelEngine({
  generate: function(x, y, z) {
    // Funcion generadora de terreno
    return y === 0 ? 1 : 0; // Suelo plano
  },
  chunkDistance: 2,
  materials: ['grass', 'dirt', 'stone']
});
```

---

### 5. threejs-vox-loader

| Campo | Valor |
|-------|-------|
| **npm** | `npm install threejs-vox-loader` |
| **Proposito** | Loader alternativo para .vox |

#### Descripcion
Loader de terceros para archivos MagicaVoxel en Three.js. Alternativa al loader oficial.

---

## Herramientas de Creacion

### MagicaVoxel

| Campo | Valor |
|-------|-------|
| **URL** | https://ephtracy.github.io/ |
| **Precio** | Gratuito |
| **Plataformas** | Windows, macOS |
| **Formato nativo** | .vox |

#### Descripcion
Editor gratuito para crear modelos 3D con voxels (cubos volumetricos). Es el estandar de la industria para arte voxel.

#### Caracteristicas
- Interfaz intuitiva de pintura 3D
- Paleta de 256 colores
- Motor de raytracing para renders
- Soporte para animaciones basicas
- Modo de edicion por capas

#### Formatos de Exportacion
| Formato | Uso |
|---------|-----|
| `.vox` | Nativo, editable |
| `.obj` | Universal 3D |
| `.gltf` / `.glb` | Web/Three.js |
| `.png` | Renders 2D |
| `.gif` | Animaciones |

#### Flujo de Trabajo Tipico
1. **Crear** - Dibujar voxel por voxel
2. **Colorear** - Aplicar paleta de colores
3. **Renderizar** - Preview con raytracing
4. **Exportar** - .obj o .vox para usar en Three.js

#### Recursos de Aprendizaje
- Tutoriales en YouTube
- Comunidad en Reddit r/MagicaVoxel
- Modelos de ejemplo incluidos

---

## Packs de Assets Gratuitos

### 1. Kenney Voxel Pack (Altamente Recomendado)

| Campo | Valor |
|-------|-------|
| **URL** | https://www.kenney.nl/assets/voxel-pack |
| **Assets** | 190+ |
| **Licencia** | CC0 (Dominio Publico) |
| **Tamano Tile** | 128x128 px |

#### Descripcion
Pack completo para juegos sandbox/survival con texturas, items y personajes en estilo voxel. Licencia CC0 significa uso libre sin atribucion.

#### Contenido
- Personajes voxel
- Items y objetos
- Texturas de terreno
- Tiles 2D y modelos 3D
- Skybox, particulas, sol/luna

#### Otros Packs de Kenney
| Pack | Assets | URL |
|------|--------|-----|
| Voxel Kit | 48 | https://kenney.nl/assets/voxel-kit |
| Blocky Characters | Varios | https://www.kenney.nl/assets?t=character |

#### Por Que Kenney es Recomendado
- Calidad profesional consistente
- CC0 = sin restricciones legales
- Actualizaciones frecuentes
- 30,000+ assets totales disponibles

---

### 2. OpenGameArt - Voxel Character Kit

| Campo | Valor |
|-------|-------|
| **URL** | https://opengameart.org/content/voxel-character-kit |
| **Licencia** | CC-BY 3.0 |
| **Autor** | Dezra's Dragons |
| **Tamano** | 405.3 KB |

#### Descripcion
Kit modular para crear personajes RPG con partes intercambiables. Ideal para sistemas de customizacion.

#### Contenido
- **Cuerpos**: Masculino y femenino
- **Partes**: Brazos, piernas, torso
- **Accesorios**: Pelo, ropa, armadura
- **Rigging**: Basico incluido (brazos, piernas, torso)

#### Formato
- `.dae` (COLLADA) - Compatible con Blender
- Exportable via VoxelShop

#### Uso
Facilmente customizable y extendible. Ideal para principiantes sin experiencia en modelado 3D.

#### Atribucion Requerida
Creditar a "Dezra's Dragons" con enlace al perfil.

---

### 3. ArtStation - 12 Characters Pack

| Campo | Valor |
|-------|-------|
| **URL** | https://www.artstation.com/artwork/vBmy6 |
| **Autor** | Steven Scott |
| **Personajes** | 12 |
| **Licencia** | Libre (incluso comercial) |

#### Descripcion
Pack gratuito con 12 personajes voxel y una escena. Incluye formato OBJ para facil integracion.

#### Permisos
- Compartir y redistribuir
- Modificar y transformar
- Uso comercial permitido

---

### 4. itch.io - Coleccion de Assets Voxel

| Campo | Valor |
|-------|-------|
| **URL Principal** | https://itch.io/game-assets/free/tag-voxel |
| **Personajes** | https://itch.io/game-assets/free/tag-characters/tag-voxel |
| **Asset Packs** | https://itch.io/game-assets/tag-asset-pack/tag-voxel |

#### Packs Destacados Gratuitos

| Pack | Contenido | Formatos |
|------|-----------|----------|
| 20 Characters Pack | 20 personajes 3D | .OBJ, .PLY, .VOX, .BLEND |
| Fantasy Characters | 9 personajes fantasy | .vox, .obj |
| Voxel Animals & Props | Animales, props, bloques | Varios |
| Chibi Hats | Gorros para personajes | .vox |
| Voxel Dungeon Crawler | Cientos de assets RPG | .vox, .obj |
| Fantasy Furniture | 31 muebles/props | .vox |

#### Licencias Comunes en itch.io
- CC0 (Dominio Publico)
- CC-BY (Requiere atribucion)
- Uso personal/indie gratuito

---

### 5. GitHub - enkisoftware/voxel-models

| Campo | Valor |
|-------|-------|
| **URL** | https://github.com/enkisoftware/voxel-models |
| **Licencia** | CC BY 4.0 |
| **Modelos** | 20+ |

#### Modelos Disponibles
- Boat, Cat, Lion, Fish
- House, Tower, Building_Ruined
- Spaceship, Ship_Crashed
- Tree_Metal, Mushrooms, Cornfield
- Cornell_Box (para pruebas de render)

#### Formatos
- `.avwr` (Avoyd World)
- Convertible a `.vox` via MagicaVoxel

---

### 6. CGTrader & TurboSquid

| Plataforma | URL | Modelos Gratis |
|------------|-----|----------------|
| CGTrader | https://www.cgtrader.com/3d-models/magicavoxel | 497+ |
| TurboSquid | https://www.turbosquid.com/Search/3D-Models/magicavoxel | 100+ |

#### Formatos Disponibles
MAX, OBJ, FBX, 3DS, C4D, Blender

#### Notas
- Mezcla de assets gratuitos y de pago
- Verificar licencia individual de cada modelo
- Calidad variable

---

## Librerias de Avatares (No Voxel)

### DiceBear (Solo 2D)

| Campo | Valor |
|-------|-------|
| **URL** | https://www.dicebear.com |
| **Estilos** | 31 |
| **Licencia** | MIT |

#### Descripcion
Libreria open source para generar avatares 2D con multiples estilos. No es voxel pero es referencia para sistemas de avatares.

#### Estilos Disponibles
- **Pixel Art** - Retro pixelado
- **Avataaars** - Expresivos (Pablo Stanley)
- **Bottts** - Robots
- **Adventurer** - Ilustrados
- **Big Ears/Smile** - Caracteres distintivos
- **Lorelei** - Retratos detallados
- **Miniavs** - Compactos
- **Open Peeps** - Diversos
- Y 20+ mas...

#### Uso con React
```javascript
import { createAvatar } from '@dicebear/core';
import { pixelArt } from '@dicebear/collection';

const avatar = createAvatar(pixelArt, {
  seed: 'user123',
  hair: ['short'],
  accessories: ['glasses'],
});

const svg = avatar.toString();
```

#### Por Que es Relevante
- Ejemplo de sistema modular de avatares
- API bien disenada para customizacion
- Generacion basada en seed (determinista)

---

### Ready Player Me

| Campo | Valor |
|-------|-------|
| **URL** | https://readyplayer.me |
| **Tipo** | Avatares 3D realistas |
| **Integracion** | Three.js, Unity, Unreal |

#### Descripcion
Plataforma para crear avatares 3D realistas a partir de selfies. No es voxel pero es referencia para sistemas de avatares 3D.

---

### @verseengine/three-avatar

| Campo | Valor |
|-------|-------|
| **npm** | `npm install @verseengine/three-avatar` |
| **GitHub** | https://github.com/VerseEngine/three-avatar |

#### Descripcion
Sistema completo de avatares para Three.js con soporte para VRM, IK y lipsync.

---

## Comparacion de Enfoques

### Implementacion Actual de Maity vs Alternativas

| Aspecto | BoxGeometry (Actual) | Assets MagicaVoxel | VOXLoader |
|---------|---------------------|-------------------|-----------|
| **Assets externos** | No requiere | Requiere .obj | Requiere .vox |
| **Customizable runtime** | 100% | Pre-definido | Pre-definido |
| **Peso en KB** | ~0 (procedural) | 50-200KB/modelo | 20-100KB/modelo |
| **Complejidad visual** | Media | Alta | Alta |
| **Tiempo desarrollo** | Bajo | Alto (crear assets) | Medio |
| **Flexibilidad colores** | Total | Limitada a textura | Limitada a paleta |

### Pros y Contras

#### Enfoque Procedural (Actual)
**Pros:**
- Cero peso en assets
- Customizacion infinita en runtime
- Consistencia visual garantizada
- Facil agregar nuevas partes

**Contras:**
- Menos detalle visual
- Requiere codigo para cada parte nueva

#### Enfoque con Assets
**Pros:**
- Mayor detalle y calidad visual
- Assets profesionales disponibles
- Menos codigo para variantes

**Contras:**
- Peso adicional en la app
- Menos flexibilidad de colores
- Requiere herramientas externas

---

## Recomendacion para Maity

### Sistema de Progresion Propuesto

```
+--------------------------------------------------+
|              AVATAR BASE (Nivel 1)                |
|  Cuerpo basico + 1 color + pelo default           |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|           NIVEL 2 - Promesa                       |
|  + Colores adicionales                            |
|  + Estilos de pelo (3-4 opciones)                 |
|  + Tipos de cuerpo                                |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|           NIVEL 3 - Guerrero                      |
|  + Sombreros/gorros                               |
|  + Lentes                                         |
|  + Audifonos                                      |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|           NIVEL 4 - Maestro                       |
|  + Ropa especial (camisetas, sudaderas)           |
|  + Accesorios premium (corbatas, collares)        |
|  + Mas colores de piel                            |
+--------------------------------------------------+
                        |
                        v
+--------------------------------------------------+
|           NIVEL 5 - Leyenda                       |
|  + Items legendarios (coronas, capas)             |
|  + Efectos visuales (auras, particulas)           |
|  + Colores exclusivos (dorado, holografico)       |
+--------------------------------------------------+
```

### Inventario Sugerido de Items

| Categoria | Basico (Gratis) | Desbloqueables |
|-----------|-----------------|----------------|
| **Cabeza** | Pelo corto default | Pelo largo, calvo, mohawk, afro |
| **Sombreros** | - | Gorra, gorro, corona, casco, boina |
| **Cara** | - | Lentes, lentes sol, parche, mascara |
| **Cuerpo** | Camisa lisa | Sudadera, chaleco, camiseta estampada |
| **Accesorios** | - | Audifonos, corbata, monito, collar, capa |
| **Colores piel** | 3 tonos | 8+ tonos |
| **Colores ropa** | 4 colores | Paleta completa |
| **Efectos** | - | Aura brillante, particulas, estela |

### Recomendacion Final

**Mantener el enfoque procedural actual** y expandirlo con mas opciones:

1. Es mas flexible para el sistema de progresion
2. Cero peso adicional en la app
3. Customizacion de colores en tiempo real
4. Facil de agregar nuevos items via codigo

Si en el futuro se desea mayor detalle visual, se pueden importar modelos de Kenney o crear propios en MagicaVoxel como complemento.

---

## Referencias y Enlaces

### Repositorios
- [Expo-Crossy-Road](https://github.com/EvanBacon/Expo-Crossy-Road)
- [Crossy-ComGraphics](https://github.com/hoangtan-dev/Crossy-ComGraphics)
- [voxel](https://github.com/max-mapper/voxel)
- [voxel-engine](https://github.com/max-mapper/voxel-engine)
- [enkisoftware/voxel-models](https://github.com/enkisoftware/voxel-models)

### Herramientas
- [MagicaVoxel](https://ephtracy.github.io/)
- [Three.js VOXLoader](https://threejs.org/examples/webgl_loader_vox.html)

### Assets Gratuitos
- [Kenney Assets](https://www.kenney.nl/assets?t=voxel)
- [OpenGameArt](https://opengameart.org/content/voxel-character-kit)
- [itch.io Voxel Assets](https://itch.io/game-assets/free/tag-voxel)
- [ArtStation 12 Characters](https://www.artstation.com/artwork/vBmy6)

### Librerias npm
- `parse-magica-voxel`
- `voxel`
- `voxel-engine`
- `threejs-vox-loader`
- `@dicebear/core`
