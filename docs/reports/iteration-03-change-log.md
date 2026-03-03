# Iteration 03 Change Log (WEB)

## Code
- Updated `src/index.html`
  - Added Google OAuth UI (client id input, init/login buttons, render container).
  - Added process-check button.
- Updated `src/main.js`
  - Added Google JWT decode and credential handling.
  - Added `googleToken` login payload path.
  - Added `checkUserCreateFlow` diagnostic flow.
- Updated `src/styles.css`
  - Added Google section UI styles.
- Added `tests/google-login-process-check.sh`
  - Live API process verification script against localhost backend.

## Docs
- Added iteration docs:
  - `docs/plan/iteration/iteration-03-plan.md`
  - `docs/test/results/iteration-03-test-result.md`
  - `docs/reports/iteration-03-result.md`
  - `docs/reports/iteration-03-change-log.md`
