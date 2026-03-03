# Testing Strategy (WEB)

## Test Types
- Smoke script for API client utility and basic runtime checks.
- Manual integration run with backend server for end-to-end user flow.

## Minimum Coverage for Iteration 01
- Login / logout / me flow.
- Board create/list/rename/delete flow.
- Memo type list and memo create/list/update/delete flow.
- Error message rendering when API fails.

## Execution Rules
- Run `npm run test` before completion.
- If full browser e2e framework is not installed, run deterministic smoke checks and document manual verification steps.
- Record commands and outcomes in iteration test result document.
