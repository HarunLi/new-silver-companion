module.exports = {
  name: "银发伴侣",
  slug: "silver-companion",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.silvercompanion.app"
  },
  android: {
    package: "com.silvercompanion.app"
  },
  plugins: [
    "expo-camera",
    "expo-location",
    "expo-image-picker"
  ]
};
