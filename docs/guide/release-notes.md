# Release Notes

## Version

- `v0.3.0` (Phase 1~3 complete)
- Date: 2026-02-26

## Included

1. Phase 1
- Auth UI + auth/session/logout API integration
- Board CRUD and memo CRUD
- 1-second delayed autosave on memo blur

2. Phase 2
- Memo toolbar (3 types)
- Drag to move memo and persist position
- Resize memo and persist dimensions
- Ctrl + Wheel zoom on board

3. Phase 3
- Error message normalization
- Retry button for last failed action
- Busy-state UI while request is in-flight
- Expanded domain tests and operation guide

## Known Constraints

- Google OAuth real flow is not implemented in backend spec yet.
- Board drag hierarchy API is not implemented.
- Z-index full reorder API is not implemented.

## Verification

- Unit tests: pass
- Runtime smoke check: pass
