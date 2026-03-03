# API Spec (Web Consumer View)

## 공통
- Base URL: `/api/v1`
- 인증: HttpSession 쿠키 (`withCredentials: true`)
- 응답 포맷
```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "errorCode": null,
  "timestamp": "2026-03-03T12:00:00"
}
```

## Auth
- `POST /auth/login`
  - req: `googleAccount`, `token`, `name`
  - res: 로그인 성공 + 세션 생성
- `GET /auth/me`
  - res: 현재 세션 사용자
  - fail: `401 UNAUTHORIZED`
- `POST /auth/logout`
  - res: 세션 만료

## Board
- `GET /boards`: 사용자 보드 목록
- `POST /boards`: 보드 생성
  - req: `boardId`, `parentBoardId`, `boardName`, `sortOrder`
- `PATCH /boards/{boardId}/name`: 보드명 수정
  - req: `boardName` (max 20)
- `PATCH /boards/{boardId}/move`: 보드 위치 이동
  - req: `parentBoardId`, `sortOrder`
- `DELETE /boards/{boardId}`: 보드 논리삭제

## Memo Type
- `GET /memo-types`: 활성 타입 목록

## Memo
- `GET /boards/{boardId}/memos`: 보드 메모 조회
- `POST /boards/{boardId}/memos`: 메모 생성
  - req: `memoId`, `typeId`, `content`, `posX`, `posY`, `width`, `height`, `zIndex`
- `PATCH /memos/{memoId}/content`: 내용 수정
- `PATCH /memos/{memoId}/position`: 위치 수정
- `PATCH /memos/{memoId}/size`: 크기 수정
- `PATCH /boards/{boardId}/memos/zindex`: z-index 일괄 수정
  - req: `memos: [{ memoId, zIndex }]`
- `DELETE /memos/{memoId}`: 메모 논리삭제

## 에러 계약
- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `404 NOT_FOUND`
- `409 CONFLICT`
