# Adventure Escape SA

Adventure Escape SA includes the responsive HTML website and its Expo mobile app.

## Website

Open `index.html` in a browser or serve this folder with a local static web server. The site has
12 HTML pages, including the welcome screen, with shared responsive styling in `css/styles.css`.

## Expo app

The cross-platform Expo Router app is in `expo-app`.

```powershell
cd expo-app
npm install
npm run web
```

Use `npm start` to launch the Expo development server for Android, iOS, or web. The app includes
the site's main content pages and a grouped mega-menu navigation. Customer Login is a demo only;
it does not authenticate users or send or store credentials.

The installable Android APK is a generated build artifact and is not tracked in this repository.
Build APKs with EAS using the `preview` profile in `expo-app/eas.json`.
