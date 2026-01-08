import type { ShowcaseItem } from '../types/showcase.types';

export const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: 'procedural',
    title: 'Procedural (Actual)',
    description: 'BoxGeometry generado en runtime con React Three Fiber',
    approach: 'procedural',
    pros: [
      'Sin assets externos (0 KB)',
      'Totalmente customizable en runtime',
      'Colores modificables al instante',
      'Control total del codigo',
    ],
    cons: [
      'Modelado complejo en codigo',
      'Dificil crear formas organicas',
      'Mas trabajo de desarrollo inicial',
    ],
    fileSize: '0 KB',
    loadTime: 'Instantaneo',
  },
  {
    id: 'vox',
    title: 'VOXLoader (.vox)',
    description: 'Formato nativo de MagicaVoxel - editor gratuito de voxels',
    approach: 'vox',
    pros: [
      'Edicion visual en MagicaVoxel',
      'Formato muy compacto',
      'Paleta de colores incluida',
      'Facil de crear y modificar',
    ],
    cons: [
      'Sin soporte de animaciones',
      'Paleta limitada a 256 colores',
      'Loader no incluido en drei',
    ],
    fileSize: '~15-50 KB',
    loadTime: '~100ms',
    assetPath: '/avatar-showcase/vox/chr_knight.vox',
  },
  {
    id: 'obj',
    title: 'OBJLoader (.obj)',
    description: 'Formato estandar Wavefront - exportable desde cualquier software 3D',
    approach: 'obj',
    pros: [
      'Compatibilidad universal',
      'Facil de exportar desde Blender/Maya',
      'Soporte de materiales (MTL)',
      'Bien documentado',
    ],
    cons: [
      'Sin soporte de animaciones',
      'Archivos mas grandes que VOX',
      'Requiere archivo MTL separado',
    ],
    fileSize: '~50-150 KB',
    loadTime: '~200ms',
    assetPath: '/avatar-showcase/obj/robot.obj',
  },
  {
    id: 'gltf',
    title: 'GLTFLoader (.glb)',
    description: 'Kenney Mini Characters - Pack gratuito CC0',
    approach: 'gltf',
    pros: [
      'Soporte de animaciones',
      'Formato moderno optimizado',
      'Materiales PBR incluidos',
      'Preloading con drei',
    ],
    cons: [
      'Archivos mas pesados',
      'Requiere software 3D profesional',
      'Mas complejo de modificar',
    ],
    fileSize: '~100-300 KB',
    loadTime: '~300ms',
    assetPath: '/avatar-showcase/gltf/character.glb',
  },
];

export const SHOWCASE_INFO = {
  title: 'Comparativa de Avatares Voxel',
  description:
    'Compara diferentes enfoques para renderizar avatares 3D estilo voxel. Cada enfoque tiene sus ventajas y desventajas.',
  recommendation:
    'Para maxima flexibilidad y personalizacion en runtime, el enfoque procedural es recomendado. Para assets pre-diseñados con mayor detalle visual, considera GLB o VOX.',
};
