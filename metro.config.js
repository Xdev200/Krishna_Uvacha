const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('db', 'wasm');

module.exports = wrapWithReanimatedMetroConfig(config);
