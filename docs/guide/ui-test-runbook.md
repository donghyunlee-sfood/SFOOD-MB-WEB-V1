# UI Test Runbook

## Preconditions
- Backend API is running at `http://localhost:8080`.
- Browser allows third-party script load for Google GSI (`https://accounts.google.com/gsi/client`).

## Start Web UI
1. Run `npm run dev`
2. Open the Vite local URL (default `http://localhost:5173`)

## Smoke UI Flow
1. Login panel:
- Click `Init Google`
- Complete Google account selection
- Click `Google Login`

2. Main entry check:
- `Boards` list is loaded
- `Memo Types` can be loaded

3. Core interactions:
- Create board
- Rename board
- Move board (if backend move API is updated)
- Create/update/delete memo

## Automated Checks (before manual UI)
- `npm run test`
- `npm run test:matrix`
- `npm run test:google-main`
- `npm run test:ui-ready`

## Notes
- If board move fails with `500`, restart backend with latest APP build and re-run `npm run test:matrix`.
