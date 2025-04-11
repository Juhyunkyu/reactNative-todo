module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // 리애니메이티드 플러그인을 제거하고 실행해보세요
      // 'react-native-reanimated/plugin'
    ],
  };
};
