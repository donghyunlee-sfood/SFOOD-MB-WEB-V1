# Iteration 04 Result

## Problem Verification
- Board rename could fail around focus/blur transitions.
- Board creation flow used prompt and did not satisfy LNB inline component requirement.
- User required API-driven confirmation before UI persistence.

## Fixes Implemented
1. LNB inline board draft component
- Root add and child add now create an inline input row in LNB.
- User enters name directly in component and submits with Save/Enter.
- Cancel/Escape removes draft row.

2. API-first board creation + rollback
- Draft board is not persisted into board list until `POST /boards` succeeds.
- On create failure, UI returns to pre-create state and restores editable draft row (rollback path).

3. Rename stability improvements
- Added rename submit lock (`boardRenamePending`) to prevent duplicate commit race.
- If name is unchanged, rename exits cleanly without API call.
- Escape exits rename mode safely.

4. API-driven data principle retained
- Board and memo lists are populated from API responses (`getBoards`, `getMemos`).
- No local default board bootstrap in frontend.

## Files Updated
- `app.js`
- `docs/plan/iteration/iteration-04-plan.md`
- `docs/reports/iteration-04-analysis.md`
- `docs/test/results/iteration-04-test-result.md`
- `docs/reports/iteration-04-result.md`

## Validation
- `npm test` -> PASS
- `npm run smoke` -> PASS
- API route check -> No `404` on spec paths (`/auth/login` 200, protected routes 401 without session)
