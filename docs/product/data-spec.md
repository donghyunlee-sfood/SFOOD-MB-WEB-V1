# Data Spec (Web DTO Contract)

## ID 규칙
- Board ID: `{account}_{random10}`
- Memo ID: `{boardId}_{random10}`
- `random10`: 영문/숫자/특수문자 조합 10자리

## 클라이언트 모델

### User
- `userId: string`
- `name: string`
- `email?: string`

### Board
- `boardId: string`
- `parentBoardId: string | null`
- `boardName: string`
- `sortOrder: number`

### Memo
- `memoId: string`
- `boardId: string`
- `typeId: string`
- `content: string`
- `posX: number`
- `posY: number`
- `width: number`
- `height: number`
- `zIndex: number`

### MemoType
- `typeId: string`
- `name: string`
- `shape: string`
- `defaultColor: string`

## 공통 응답 타입
- `success: boolean`
- `data: T`
- `message: string`
- `errorCode: string | null`
- `timestamp: string`
