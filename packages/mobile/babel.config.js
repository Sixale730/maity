module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        jsxImportSource: 'react'
      }]
    ],
    plugins: [
      // Transform TypeScript
      ['@babel/plugin-transform-typescript', {
        isTSX: true,
        allowDeclareFields: true
      }],
      // Transform class properties
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      // Transform private methods
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      // Transform private property in object
      ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      // Transform runtime for helpers
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: false
      }],
      // Reanimated plugin must be last
      'react-native-reanimated/plugin',
    ],
  };
};