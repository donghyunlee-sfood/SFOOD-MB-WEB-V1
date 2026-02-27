# Iteration 03 Result

## Problem Confirmation
1. Feature APIs failed after login despite main page access.
2. IDs used in board/memo path parameters could include reserved URL characters (`#`, `%`, etc.).
3. Client API methods embedded raw IDs into request paths without encoding.
4. This could cause broken routing and widespread 4xx/invalid response errors.

## Fix Targets
- `src/api.js`
  - Add path segment encoding helper.
  - Apply encoding for all boardId/memoId path parameters.
- `src/core.js`
  - Make generated random token URL-safe (`A-Za-z0-9`) for future IDs.
- `test/core.test.js`
  - Add assertion for URL-safe token generation.
- `test/api-client.test.js`
  - Add regression test for encoded board/memo endpoint URLs.

## Changes Applied
- Encoded path params in endpoints:
  - `/boards/{boardId}/name`, `/move`, `/memos`, `/memos/zindex`, delete
  - `/memos/{memoId}/content`, `/position`, `/size`, delete
- Switched random ID character set to alphanumeric only.
- Added API-client path encoding unit test.

## Validation
- `npm test` -> PASS (8/8)
- `npm run smoke` -> PASS

## Notes
- Existing IDs already stored with reserved characters are now handled correctly by encoded API requests.
- New IDs generated from this version are URL-safe by default.
