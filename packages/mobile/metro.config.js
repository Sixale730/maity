const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Explicitly set project root
config.projectRoot = projectRoot;

// 1. Watch all files within the monorepo including the shared package
config.watchFolders = [
  workspaceRoot,
  path.resolve(workspaceRoot, 'packages/shared'),
];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Configure resolver to handle TypeScript files from workspace packages
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// 5. Add extra node modules that should be transformed
// This is crucial for monorepo packages
config.resolver.extraNodeModules = {
  '@maity/shared': path.resolve(workspaceRoot, 'packages/shared/src'),
};

// 6. Enable transformation for workspace packages
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// 7. Make sure Metro knows to transform our shared package
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = config;