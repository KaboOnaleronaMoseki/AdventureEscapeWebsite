# Adventure Escape SA Expo app

The original HTML/CSS website remains at the project root. This directory is the native Expo
application, built with React Native and Expo Router.

## Run the app

```powershell
cd path\to\adventure-escape-sa\expo-app
npm install
npm start
```

Choose how you want to run it:

- **Android emulator:** Install Android Studio, create and start an Android Virtual Device, then
  run `npm run android`.
- **iOS Simulator:** On macOS with Xcode installed, start a simulator and run `npm run ios`.
- **Physical iOS or Android device:** Install Expo Go and run `npm run device`. Scan the QR code
  with the Expo Go app. Tunnel mode also works when the device and computer are on different
  networks.
- **Web browser:** Run `npm run web` and open the local URL printed by Expo.

The app supports portrait and landscape orientation and tablet layouts. Emulator launch requires
the relevant platform SDK/simulator to be installed; iOS Simulator is only available on macOS.

The native welcome screen is the app entry point. Tap **Enter the adventure** to open the home
screen. Use the **Menu** button to open the grouped navigation for Home, About, Activities,
Packages, Accommodation, Destinations, Safety, Gallery, Fees, Contact, and Customer Login.
Customer Login is a nonfunctional preview and does not send or save credentials. Stack screens
use a horizontal slide transition.
