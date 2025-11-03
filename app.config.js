
require('dotenv').config();

module.exports = {
  expo: {
    name: "Digital Mobility",
    slug: "digital-mobility-platform",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/splash-icon.png",
    scheme: "mobility",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.digitalmobilityplatform"
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      package: "com.anonymous.digitalmobilityplatform"
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
      bundler: "metro",
      "faviconMimeType": "image/png"
    },
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#E6F4FE"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 1000,
          resizeMode: "cover",
          backgroundColor: "#E6F4FE",
          dark: {
            image: "./assets/images/splash-icon.png",
            backgroundColor: "#E6F4FE"
          }
        }
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Show current location on map."
        }
      ],
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsImpl": "mapbox",
          "RNMapboxMapsDownloadToken": process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "fe09381d-a188-4dc4-8665-bb7ac20ce1ed"
      }
    }
  }
};
