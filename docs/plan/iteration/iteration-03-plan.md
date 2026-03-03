# Iteration 03 Plan (WEB)

## Goal
Investigate login/logout failure, add Google-linked login flow in frontend, and verify user-creation process after login.

## Scope
- Add Google Identity integration UI and token handling.
- Send login request with `googleToken`.
- Verify `/api/auth/login -> /api/auth/me -> /api/boards` sequence for user creation/init side effects.
- Add executable process-check test script.
