# Porting Decision

## Strategy
Chosen: **C — minimal copy/stub**.

The repository lacks a standalone `travel/` app, so shared path imports (`@travel/*`) cannot resolve. A TypeScript compile test failed with `Cannot find module '@travel/anything'`, demonstrating that aliasing to a non-existent package breaks the build.

## Impact
- Expanded stub Firebase/service layer under `web/` to simulate auth and map storage via `localStorage`.
- Added demo login and map-saving pages; `travel/` source still absent.

Further implementation requires the original `travel/` source to replace mocks.
