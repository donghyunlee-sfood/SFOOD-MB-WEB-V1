# Data Specification

## Board
- `boardId: string` unique, format `<accountId>_<random10>`
- `parentBoardId: string | null`
- `boardName: string` length 1..20
- `sortOrder: number`
- `isHide: boolean`

## Memo
- `memoId: string` unique, format `<boardId>_<random10>`
- `boardId: string`
- `typeId: string` (default `TYPE_BASIC`)
- `content: string`
- `posX: number`
- `posY: number`
- `width: number`
- `height: number`
- `zIndex: number`
- `isHide: boolean`

## Client Storage (Iteration 01)
- Storage key: `memo-board-v1`
- Shape:
  - `accountId: string`
  - `boards: Board[]`
  - `memosByBoard: Record<string, Memo[]>`
  - `selectedBoardId: string | null`
