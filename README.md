# TaskFlow Mobile

![CI](https://github.com/sciamanamarcio/taskflow-mobile/actions/workflows/ci.yml/badge.svg)

A **React Native** app (Expo + TypeScript) for managing tasks, built on top of [TaskFlow API](https://github.com/sciamanamarcio/taskflow-api). It features secure token storage, session restore, an infinite task list, component tests and a CI pipeline.

It is the mobile companion of [TaskFlow Dashboard](https://github.com/sciamanamarcio/taskflow-dashboard): the same API, consumed from web and mobile.

## Features

- Register, log in and log out, with the session restored on app start
- JWT stored in the device keychain/keystore (`expo-secure-store`)
- Task list with infinite scroll, pull-to-refresh and status filter
- Create and edit tasks in a modal, mark them as done, delete with confirmation
- Typed API client with consistent error handling (automatic logout on an expired token)
- API address resolved automatically in development, so no manual IP setup
- Component and unit tests with Jest and React Native Testing Library
- GitHub Actions CI (lint, typecheck, tests and a production bundle build) and Dependabot

## Tech stack

| Layer | Choice |
|-------|--------|
| App | React Native with Expo (managed workflow) |
| Language | TypeScript (strict) |
| Server state | TanStack Query 5 (`useInfiniteQuery`) |
| Secure storage | expo-secure-store |
| Testing | Jest (jest-expo) + React Native Testing Library |
| Lint | ESLint with eslint-config-expo |
| DevOps | GitHub Actions, Dependabot |

## Architecture

```
src/
├── auth/         # AuthContext: session state, login, register, logout
├── components/   # TaskItem, TaskFormModal, StatusFilter
├── lib/          # API client, tasks API, token storage, React Query hooks
├── screens/      # AuthScreen, TasksScreen
├── config.ts     # API base URL resolution
└── theme.ts      # colors
App.tsx           # providers and auth gate
```

- `lib/api.ts` is the single HTTP entry point: it attaches the token, normalizes errors into `ApiError` and triggers logout on `401`.
- The app shows `AuthScreen` or `TasksScreen` depending on the session, so no navigation library is needed for two screens.
- Query keys include the user id, so cached data never leaks between accounts.

## Getting started

Requires Node 22, the [TaskFlow API](https://github.com/sciamanamarcio/taskflow-api) running on port `3333`, and the **Expo Go** app on your phone (or an Android/iOS emulator).

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go. The phone and the computer must be on the same network.

### API address

In development the app calls the API on the same host that serves the app (Metro), on port `3333`. To point it somewhere else, set an environment variable:

```bash
EXPO_PUBLIC_API_URL=https://your-api.example.com npx expo start
```

### Using WSL2

On Windows with WSL2, the phone cannot reach the virtual network directly. Forward ports `8081` (Metro) and `3333` (API) from Windows to WSL, and start Expo with the Windows IP:

```bash
REACT_NATIVE_PACKAGER_HOSTNAME=<windows-ip> npx expo start
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm test` | Run the test suite |
| `npm run lint` | Lint the code |
| `npm run typecheck` | Type-check with TypeScript |

## Design decisions

- **SecureStore for the token** instead of plain storage, so the JWT lives in the iOS Keychain and Android Keystore.
- **Token kept in memory and persisted**: requests read it synchronously, and the session still survives app restarts.
- **`useInfiniteQuery`** for the list, which fits mobile scrolling better than numbered pages.
- **Centralized unauthorized handler**, keeping expiry logic out of the screens.
- **No navigation library yet**: two screens and a modal do not justify the extra weight.
- **Tests mock the network layer and native modules**, so the suite runs fast and without a device.
- **Dependabot ignores Expo, React and React Native**, which must move together with each Expo SDK.

## Roadmap

- [ ] Expo Router for navigation
- [ ] Offline cache and optimistic updates
- [ ] End-to-end tests with Maestro
- [ ] Production builds with EAS
- [ ] Push notifications for due tasks

## License

MIT
