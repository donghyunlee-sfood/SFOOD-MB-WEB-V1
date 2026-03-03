# Iteration 04 Feature Validation Matrix

- Time: 2026-03-03 10:35:05 KST
- Base URL: http://localhost:8080
- User: spec-user-20260303103505@example.com
- Board: spec-board-20260303103505
- Memo: spec-memo-20260303103505

## API-based checks
- PASS: 로그인(googleToken 포함)
- PASS: 보드 등록
- PASS: 보드 수정
- FAIL: 보드 위치 이동 미지원(status=500)
- PASS: 메모 타입 조회
- PASS: 메모 생성
- PASS: 메모 수정
- PASS: 메모 크기 변경
- PASS: 메모 위치 이동
- PASS: 메모 삭제
- PASS: 보드 삭제
- PASS: 로그아웃
- PASS: 세션 만료(로그아웃 후 접근 차단)

## Frontend code checks
- PASS: 보드/메모 자동 ID 생성 로직 존재
