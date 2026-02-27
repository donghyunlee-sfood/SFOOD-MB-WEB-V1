# Iteration 03 Analysis

## Goal
Investigate why all features fail after entering main page, then patch client-side API integration issues.

## Reproduction Findings
- Main page entry confirms `/api/v1/auth/*` communication partially works.
- Feature APIs fail frequently after board/memo creation.

## Root Cause Candidate
`boardId` and `memoId` can contain reserved URL characters because ID random charset includes `!@#$%`.

Current issue:
- IDs are directly embedded in path without URL encoding.
- Example affected paths:
  - `/boards/{boardId}/name`
  - `/boards/{boardId}/memos`
  - `/memos/{memoId}/content`
- If ID includes `#` or `%`, browser path parsing breaks and server receives wrong route.

## Additional Stability Issue
When running through Vite dev server, `/api/*` requires proxy to backend. This was added in `vite.config.js` and should remain enabled.

## Fix Plan
1. Add path segment encoding utility in API client.
2. Encode all path params before request.
3. Reduce generated random charset to URL-safe characters to prevent future IDs from becoming problematic.
4. Add tests for URL-safe ID generation.
