const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace root directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');
const sharedPackagePath = path.resolve(workspaceRoot, 'packages/shared');

const config = getDefaultConfig(projectRoot);

// Explicitly set project root
config.projectRoot = projectRoot;

// 1. Watch all files within the monorepo
config.watchFolders = [
  workspaceRoot,
  sharedPackagePath,
];

// 2. Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Disable hierarchical lookup
config.resolver.disableHierarchicalLookup = true;

// 4. Configure resolver to handle TypeScript files
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// 5. Map @maity/shared to its compiled directory
config.resolver.extraNodeModules = {
  '@maity/shared': path.resolve(sharedPackagePath, 'dist'),
};

// 6. Ensure shared package files are not excluded
config.resolver.blockList = exclusionList([
  // Exclude test files and other non-runtime files
  /.*\/__tests__\/.*/,
  /.*\.test\.(js|jsx|ts|tsx)$/,
  /.*\.spec\.(js|jsx|ts|tsx)$/,
]);

// 7. Transform options for TypeScript
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Helper function for blockList
function exclusionList(patterns) {
  return new RegExp(
    '(' +
    patterns
      .map((pattern) => pattern.source || pattern)
      .join('|') +
    ')'
  );
}

module.exports = config;