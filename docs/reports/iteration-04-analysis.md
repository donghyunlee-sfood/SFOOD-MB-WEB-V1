# Iteration 04 Analysis

## User-Reported Issues
- Error occurs when focusing board rename input.
- Error occurs when creating new board.
- Concern that app may not be fully API-driven.

## Findings
- Board creation used `prompt` flow, not LNB inline component UX.
- Rename commit relied on blur/enter without submit-state control, causing duplicate/unstable commits.
- Board creation should only materialize in UI after API success.

## Refactor Requirements
1. LNB inline draft row for root/child board creation.
2. API-first create: no optimistic insertion before success.
3. Failure handling: clear pending state and keep previous board list (rollback by design).
4. Rename stability: submit lock + unchanged-name fast exit.

## API-Driven Data Principle
- Initial boards and memos are always loaded from API (`getBoards`, `getMemos`).
- UI will not fabricate persisted boards locally.
