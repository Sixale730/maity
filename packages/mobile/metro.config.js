const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Add the shared package to watched folders
config.watchFolders = [
  workspaceRoot,
  path.resolve(projectRoot, '../shared'),
];

// Resolve node_modules from workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
  path.resolve(projectRoot, '../shared'),
];

// Add extra node modules for resolution
config.resolver.extraNodeModules = {
  '@maity/shared': path.resolve(projectRoot, '../shared'),
};

module.exports = config;