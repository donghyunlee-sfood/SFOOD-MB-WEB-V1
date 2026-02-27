# Issue: Memo Input Mode HTML Loss (Checklist/List/Line-break)

- Issue ID: `ISSUE-2026-02-27-MEMO-EDITOR-HTML-LOSS`
- Date Opened: 2026-02-27
- Area: `app.js` memo edit-mode pipeline (Quill integration)
- Severity: High (data representation loss during edit-mode entry)

## Summary
When a memo containing checklist/list/line-break HTML enters input mode, formatting can collapse into plain text or partial blocks. Backend save/reload can remain correct, but edit-mode representation becomes inconsistent and may lead to subsequent content loss.

## User-Reported Symptoms
- Checklist items disappear or become plain text in input mode.
- `Enter`/blank lines are not preserved in edit mode.
- Example DB content was reduced to plain paragraphs such as:
  - `<p>어디 갔지?</p><p><br></p><p><br></p>`
- Example persisted structure observed:
  - `<ul data-checked="false"><li>...</li>...</ul>`
- Clicking around during edit mode unexpectedly completed editing in some paths.

## Reproduction (Observed)
1. Create memo content with mixed checklist/list/line-break formatting.
2. Save memo.
3. Re-open same memo in input mode.
4. Observe partial/full formatting loss (checkbox/list semantics missing).

## Scope Impact
- Affected: Edit-mode entry rendering/transform path.
- Not primarily affected: API transport envelope itself (`content` is sent as string payload).
- Risk: Re-saving after collapsed rendering can overwrite original rich structure.

## Consolidated Change History (Related)
The following related fixes were applied across this issue thread:
- Quill integration and fallback removal (Quill-only runtime path).
- View-mode Quill class alignment (`ql-editor`) for persisted markup display.
- Multiple edit-entry adaptation strategies (`convert`, direct paste, targeted transforms).
- Save-time normalization adjustments (whitespace/blank-line handling).
- Checklist conversion rollback (removed lossy checklist->input conversion).
- Outside-click completion boundary fixes while editing.
- Payload and E2E verification extensions for memo content.

Reference source log:
- `docs/reports/change-history.md` (2026-02-27 section)

## Technical Findings
- Backend/API path can round-trip HTML payload successfully in test scenarios.
- Main instability point is frontend edit-mode load path:
  - `stored HTML -> (adapter/Quill parse path) -> editor DOM`
- Certain checkbox/list forms (`input[type=checkbox]`, `ul[data-checked]`, marker text `☐`) are interpreted differently by Quill depending on load path.

## Test Evidence
- Unit: payload verification test ensures raw HTML is sent in `updateMemoContent`.
- E2E: memo content round-trip check includes checkbox html presence.
- Commands used repeatedly:
  - `node --test test/api-client.test.js`
  - `node test/api.e2e.js`
  - `npm run test`
- Current automated status: PASS (tests pass), but user-level scenario still reports edit-mode collapse.

## Current Status
- Status: Open (user-reported scenario not fully resolved)
- Reason: Automated checks pass, but real UI flow still shows format collapse in edit mode for mixed checklist/list data.

## Next Actions
1. Add a deterministic browser-level integration test for edit-mode re-entry with mixed HTML fixtures (checkbox/list/blank lines).
2. Capture and compare 3 snapshots per memo:
   - pre-edit stored HTML
   - HTML injected into editor on entry
   - HTML extracted on complete/save
3. Lock one canonical checklist representation across UI and storage (no dual format drift).
4. If needed, sanitize/normalize once at save boundary only, not during edit-entry.

## Files Involved
- `app.js`
- `styles.css`
- `index.html`
- `test/api-client.test.js`
- `test/api.e2e.js`
- `docs/reports/change-history.md`
- `docs/test/results/iteration-05-test-result.md`
