# RoadIntel — Mobile

**Report a pothole in three taps: photo, GPS fix, send.**

RoadIntel is a two-part civic reporting platform. This repo is the field app — the one a
citizen actually uses standing next to the pothole. The other half is
[RoadIntel-Admin](https://github.com/harshfiu/RoadIntel-Admin), the dashboard the
municipal side uses to triage what comes in.

Built with React Native and Expo, so one codebase runs on Android and iOS.

---

## What it does

- **Capture** — take a photo with the camera or pick one from the gallery, with
  in-app guidance on what makes a usable shot.
- **Locate** — grabs a high-accuracy GPS fix and shows the coordinates for review
  before anything is sent.
- **Submit** — photo and location go to Firestore as one report, timestamped and
  marked `Reported`.
- **Track** — a dashboard of every report with counts by severity, a live map of
  where they are, and a filterable list.
- **Accounts** — email/password sign-up and sign-in, with an editable profile
  (name, phone, city) stored per user.
- **Dark mode** — the whole app is themed, dark by default, toggled in Settings.

## How it works

```
CaptureScreen ──photo──▶ SubmitScreen ──photo + GPS──▶ Firestore
                                                          │
                          useReports (polls every 15s) ◀───┘
                                    │
                    Dashboard · Map · Reports screens
```

Reports are written to and read from Firestore over its REST API, which keeps the
bundle light and avoids the long-polling workarounds the Firebase SDK needs inside
React Native. Authentication goes through Google's Identity Toolkit REST endpoints,
with error codes mapped to messages a person can act on (`INVALID_LOGIN_CREDENTIALS`
becomes "Invalid email or password", not a stack trace).

The map is Leaflet and OpenStreetMap rendered inside a `WebView`, with one coloured
circle marker per report — no native map SDK and no API key to manage.

**On the severity labels:** each report gets a High / Medium / Low badge from a
deterministic placeholder in `hooks/useReports.js` — it hashes the report ID, so the
same report always shows the same badge. It is a stand-in for the real ranking, which
lives in the admin dashboard and follows the weighted priority formula from my
published pothole detection research. No model runs on the phone.

## Tech stack

| | |
|---|---|
| **App** | React Native 0.81, React 19, Expo SDK 54 |
| **Backend** | Firebase — Firestore (REST) + Identity Toolkit auth |
| **Device** | expo-image-picker, expo-location, expo-file-system |
| **Maps** | Leaflet + OpenStreetMap in react-native-webview |

## Running it

```bash
npm install
cp .env.example .env    # fill in your Firebase web-app config
npm start               # then scan the QR code with Expo Go
```

`npm run android` / `npm run ios` build to a connected device or simulator.

Firestore needs a `pothole_reports` collection and a `users` collection, plus rules
that allow the client to read and write them.

## Structure

```
App.js                 tab shell + auth gate
screens/               Login, Dashboard, Map, Reports, Settings, Capture, Submit
components/            header, bottom tabs, drawer, notifications panel
hooks/useAuth.js       sign-in, sign-up, profile
hooks/useReports.js    Firestore polling + severity badges
context/ThemeContext   dark/light theme
constants/theme.js     palette
```

---

Part of [RoadIntel](https://github.com/harshfiu/RoadIntel-Admin) · more of my work at
[harshgupta.co.in](https://www.harshgupta.co.in)
