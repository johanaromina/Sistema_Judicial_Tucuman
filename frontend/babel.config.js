module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Mantener este plugin al final según la recomendación de Reanimated
      'react-native-reanimated/plugin',
    ],
  };
};

