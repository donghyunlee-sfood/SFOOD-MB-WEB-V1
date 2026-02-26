# Frontend API Spec (SFOOD-MB-APP-V1)

이 문서는 프론트엔드 개발/테스트를 위한 현재 백엔드 API 명세다.
기준 버전: Step 4 완료 기준

## 1. 기본 정보
- Base URL (local): `http://localhost:8080`
- API Prefix: `/api/v1`
- Content-Type: `application/json`
- 인증 헤더: `X-Session-Token: {sessionToken}`

## 2. 공통 응답 규칙
### 성공
- 조회/생성/수정: `200 OK`
- 삭제: `204 No Content`

### 에러
```json
{
  "code": "VALIDATION_ERROR",
  "message": "name max length is 20",
  "timestamp": "2026-02-25T17:00:00"
}
```

주요 에러 코드:
- `VALIDATION_ERROR` (400)
- `BOARD_NOT_FOUND` (400)
- `BOARD_ALREADY_EXISTS` (400)
- `MEMO_NOT_FOUND` (400)
- `MEMO_ALREADY_EXISTS` (400)
- `SESSION_TOKEN_MISSING` (401)
- `SESSION_INVALID` (401)

## 3. 인증(Auth) API
참고: 현재 Google OAuth 연동은 미구현이며, `login`은 사용자 식별 입력 기반 세션 발급 API다.

### 3.1 로그인
- Method: `POST`
- URL: `/api/v1/auth/login`

Request:
```json
{
  "userEmail": "user@test.com",
  "userName": "홍길동"
}
```

Response 200:
```json
{
  "sessionToken": "4ff9e2c9-...",
  "expiresAt": "2026-02-26T17:30:00",
  "userEmail": "user@test.com",
  "userName": "홍길동",
  "newUser": true
}
```

설명:
- 신규 사용자면 계정과 기본 보드 1개를 자동 생성한다.
- 세션 만료 시간은 24시간이다.

### 3.2 세션 확인
- Method: `GET`
- URL: `/api/v1/auth/session`
- Header: `X-Session-Token` 필수

Response 200:
```json
{
  "userEmail": "user@test.com",
  "userName": "홍길동",
  "expiresAt": "2026-02-26T17:30:00"
}
```

### 3.3 로그아웃
- Method: `POST`
- URL: `/api/v1/auth/logout`
- Header: `X-Session-Token` 필수

Response 204:
- Body 없음

## 4. 보드(Board) API

### 4.1 보드 목록 조회
- Method: `GET`
- URL: `/api/v1/boards?userEmail={email}`

Response 200:
```json
[
  {
    "boardId": "user@test.com_default_a1b2c3d4",
    "userEmail": "user@test.com",
    "name": "기본 보드",
    "parentBoardId": null,
    "sortOrder": 0,
    "hide": false,
    "createdAt": "2026-02-25T17:00:00",
    "updatedAt": "2026-02-25T17:00:00"
  }
]
```

### 4.2 보드 생성
- Method: `POST`
- URL: `/api/v1/boards`

Request:
```json
{
  "boardId": "user@test.com_board_001",
  "userEmail": "user@test.com",
  "name": "업무 보드",
  "parentBoardId": null,
  "sortOrder": 0
}
```

Response 200:
- 생성된 보드 객체 반환 (조회와 동일 스키마)

Validation:
- `name` 최대 20자
- `boardId` 최대 120자

### 4.3 보드명 수정
- Method: `PATCH`
- URL: `/api/v1/boards/{boardId}/name`

Request:
```json
{
  "name": "새 보드명"
}
```

Response 200:
- 수정된 보드 객체 반환

### 4.4 보드 삭제(논리 삭제)
- Method: `DELETE`
- URL: `/api/v1/boards/{boardId}`

Response 204:
- Body 없음

설명:
- 물리 삭제가 아니라 `hide=true` 처리된다.

## 5. 메모(Memo) API

### 5.1 메모 목록 조회
- Method: `GET`
- URL: `/api/v1/memos?boardId={boardId}`

Response 200:
```json
[
  {
    "memoId": "memo-001",
    "boardId": "user@test.com_board_001",
    "memoTypeId": "type-basic",
    "content": "할 일 정리",
    "posX": 120,
    "posY": 80,
    "width": 320,
    "height": 220,
    "zIndex": 1,
    "textColor": "#222222",
    "fontFamily": "Pretendard",
    "fontSize": 16,
    "hide": false,
    "createdAt": "2026-02-25T17:10:00",
    "updatedAt": "2026-02-25T17:10:00"
  }
]
```

정렬 규칙:
- `zIndex ASC`, `createdAt ASC`

### 5.2 메모 생성
- Method: `POST`
- URL: `/api/v1/memos`

Request:
```json
{
  "memoId": "memo-001",
  "boardId": "user@test.com_board_001",
  "memoTypeId": "type-basic",
  "content": "할 일 정리",
  "posX": 120,
  "posY": 80,
  "width": 320,
  "height": 220,
  "zIndex": 1,
  "textColor": "#222222",
  "fontFamily": "Pretendard",
  "fontSize": 16
}
```

Response 200:
- 생성된 메모 객체 반환

기본값:
- `posX=0`, `posY=0`, `width=300`, `height=200`, `zIndex=0`

### 5.3 메모 수정
- Method: `PATCH`
- URL: `/api/v1/memos/{memoId}`

Request (부분 업데이트):
```json
{
  "content": "수정된 내용",
  "posX": 150,
  "posY": 120,
  "width": 340,
  "height": 240,
  "zIndex": 3,
  "textColor": "#111111",
  "fontFamily": "Pretendard",
  "fontSize": 14
}
```

Response 200:
- 수정된 메모 객체 반환

### 5.4 메모 삭제(논리 삭제)
- Method: `DELETE`
- URL: `/api/v1/memos/{memoId}`

Response 204:
- Body 없음

## 6. 프론트 연동 순서 (권장)
1. `POST /api/v1/auth/login` 호출 후 `sessionToken` 저장
2. 앱 시작 시 `GET /api/v1/auth/session`으로 세션 유효성 확인
3. `GET /api/v1/boards?userEmail=...`로 보드 렌더링
4. 보드 선택 시 `GET /api/v1/memos?boardId=...` 호출
5. 생성/수정/삭제 API 호출 후 목록 재조회 또는 낙관적 업데이트

## 7. 개발/테스트 실행 방법
### 7.1 서버 실행
```bash
./gradlew bootRun
```

### 7.2 빠른 수동 테스트(curl)
```bash
# 1) 로그인
curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"userEmail":"user@test.com","userName":"홍길동"}'

# 2) 보드 조회
curl -s "http://localhost:8080/api/v1/boards?userEmail=user@test.com"

# 3) 메모 생성
curl -s -X POST http://localhost:8080/api/v1/memos \
  -H 'Content-Type: application/json' \
  -d '{"memoId":"memo-001","boardId":"user@test.com_board_001","memoTypeId":"type-basic"}'
```

## 8. 구현 상태 메모
- 보드 드래그 이동 API 미구현
- Google OAuth 실제 검증 미구현 (세션 골격만 구현)
- 메모 z-index 전체 재정렬 API 미구현
