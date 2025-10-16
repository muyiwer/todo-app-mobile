import 'dotenv/config';

export default {
  expo: {
    name: "todo-app",
    slug: "todo-app",
    version: "2.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    extra: {
      assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY,
      assemblyAiApiUrl:process.env.ASSEMBLYAI_API_URL
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.todoapp",
      infoPlist: {
        NSMicrophoneUsageDescription:
          "This app needs access to the microphone for voice task input. Speak your tasks and we'll add them to your list!",
        NSSpeechRecognitionUsageDescription:
          "This app uses speech recognition to convert your voice into tasks.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ["RECORD_AUDIO"],
      package: "com.yourcompany.todoapp",
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    plugins: [
      [
        "expo-audio",
        {
          microphonePermission:
            "Allow $(PRODUCT_NAME) to access your microphone for voice task input.",
        },
      ],
    ],
  },
};
