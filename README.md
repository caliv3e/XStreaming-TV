# XStreaming TV

Android TV fork of [Geocld/XStreaming](https://github.com/Geocld/XStreaming), focused on a cleaner TV experience and safer xCloud entry flow.

> XStreaming TV is not affiliated with Microsoft or Xbox. Xbox, Game Pass, and xCloud are trademarks of their respective owners.

## What Is Included

- Based on upstream XStreaming 2.9.0.
- Android TV home, cloud, title detail, and settings focus states tuned for remote control.
- Liquid glass focus highlight for TV cards and action buttons.
- xCloud / XGPU preflight check before entering cloud gaming.
- If the account has no XGPU or the selected region has no xCloud entitlement, the app shows a prompt and stays on the current page instead of opening a stuck cloud screen.
- Safer Gradle repository resolution so Sonatype snapshot outages do not block stable dependencies.
- Release build fallback signing when a local release keystore is not configured.

## Verified

Tested on July 1, 2026 with Android TV emulator `Television_1080p`.

- Dev build installed and launched.
- Prod release APK installed and launched without Metro.
- No "Unable to load script" red screen.
- Korea region selected through settings.
- Cloud Gaming entry with an account that has no XGPU shows the permission prompt and does not freeze.

## Requirements

- Node.js 20 or newer
- Yarn
- JDK 17
- Android SDK 34
- Android NDK 23.1.7779620

## Development

Install dependencies:

```sh
yarn
```

Start Metro:

```sh
yarn start
```

Install the Android TV development build:

```sh
npx react-native run-android --variant devDebug --appId com.dev.xstreaming
```

## Build APK

Build the production Android APK:

```sh
cd android
./gradlew assembleProdRelease
```

Output:

```text
android/app/build/outputs/apk/prod/release/app-prod-release.apk
```

If no local release keystore is configured, the release APK is signed with the debug keystore so it can still be installed for testing. For real distribution, create your own keystore and pass these Gradle properties locally:

```properties
XSTREAMING_RELEASE_STORE_FILE=your-release-key.keystore
XSTREAMING_RELEASE_KEY_ALIAS=your-key-alias
XSTREAMING_RELEASE_STORE_PASSWORD=your-store-password
XSTREAMING_RELEASE_KEY_PASSWORD=your-key-password
```

Do not commit private keystores or signing passwords.

## Project Notes

The xCloud guard probes cloud session creation with the current token and default cloud region before navigation. When the service rejects the account or region, the app clears the loading state and shows a localized warning instead of leaving the TV UI stuck.

The Gradle patch for `@react-native/gradle-plugin` is stored in `patches/` and is applied by `patch-package` after dependency installation.

## Upstream

This project is based on [Geocld/XStreaming](https://github.com/Geocld/XStreaming). Please refer to the upstream project for the original mobile client, documentation, and license history.

## License

MIT. See [LICENSE](./LICENSE).
