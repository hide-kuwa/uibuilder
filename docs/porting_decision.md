# Porting Decision

## Strategy
Chosen: **C — minimal copy/stub**.

The repository lacks a standalone `travel/` app, so shared path imports (`@travel/*`) cannot resolve. A TypeScript compile test failed with `Cannot find module '@travel/anything'`, demonstrating that aliasing to a non-existent package breaks the build.

## Impact
- Added stub Firebase wiring and service layer under `web/` (approx. 30 lines total).
- No changes to existing modules; `travel/` remains untouched.

Further implementation requires the original `travel/` source to replace stubs.
