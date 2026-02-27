# Iteration 02 Analysis

## Inputs
- docs/guide/api-spec.md
- docs/guide/architectures.md
- docs/guide/requirements.md
- docs/plan/iteration/iteration-02-plan.md

## Scope Chosen
Implement high-priority frontend behaviors end-to-end in a browser app with an API-ready data layer.

## Features Targeted
- Auth screen with Google token style login input and logout flow.
- Session check on startup.
- Board list/tree rendering including child board creation.
- Inline board rename, delete confirmation, and board move action.
- LNB width resize control.
- Memo canvas with memo type toolbar (4 types).
- Memo create in center, edit/complete mode switching.
- Editor toolbar controls (color/font/size/list/check format helpers).
- Autosave delay 1 second with rollback hook on failure.
- Memo drag, resize, delete.
- Context menu z-index ordering controls.
- Ctrl + wheel zoom on board canvas.

## Data Layer Strategy
- Implement `ApiClient` matching API spec endpoints.
- Implement explicit `LocalApiMock` mode for local development.
- UI allows selecting mode; no silent fallback between modes.

## Risks
- Browser-native rich text commands differ by browser.
- Full drag-tree hierarchy can be complex without framework DnD library.

## Mitigation
- Keep drag-tree move simple and deterministic.
- Keep editor operations minimal and stored as HTML content.
