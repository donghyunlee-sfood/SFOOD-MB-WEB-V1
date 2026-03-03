# Data Spec (WEB)

## API Base
- `http://localhost:8080`

## Session
- Browser cookie session (`JSESSIONID`) is used.
- All fetch calls use `credentials: include`.

## Frontend State Model
- auth: `userId`, `name`, `loggedIn`
- board: `selectedBoardId`, `boards[]`
- memo: `memoTypes[]`, `memos[]`
- ui: `statusMessage`, `errorMessage`

## Client-side Constraints
- board name: max 20 characters
- memo width/height: positive number
