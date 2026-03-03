# Iteration 01 UI Fix Report (04)

## 작성일
- 2026-03-03

## 분석 내용
- LNB 보드명 컴포넌트 높이가 과도해 목록 밀도가 낮고 버튼 대비 불균형
- 사용자 정보/로그아웃 영역이 세로 정렬되어 공간 효율이 낮고 가독성 저하
- 메모 카드가 기울어져 배치되어 캔버스 정렬감 저하
- 메모 이동이 HTML drag 이벤트 기반이라 포인터 추적이 부자연스러움
- 메모 리사이즈가 버튼 방식이라 요구사항(보더 드래그)과 불일치
- 메모 에디터와 툴바가 카드와 겹쳐 레이아웃 충돌
- 하단 메모툴바의 초기 위치/드래그 축 동작이 직관과 반대로 느껴짐
- 토스트/저장표시가 하단 중앙/우측으로 분산되어 피드백 위치가 일관되지 않음

## 수정 파일
- `src/pages/MainPage.tsx`
- `src/components/MemoCard.tsx`
- `src/components/MemoToolbar.tsx`
- `src/components/MemoEditorToolbar.tsx`
- `src/components/BoardTree.tsx`
- `src/store/uiStore.ts`
- `src/styles/app.css`
- `docs/test/results/iteration-01-test-result.md`

## 수정 결과
- LNB 보드명 컴포넌트 높이를 액션 버튼 높이(30px)와 맞추고 폰트 축소
- 사용자 정보 영역을 가로 배치로 변경하고 이름 + 계정 + 우측 로그아웃 버튼 구성
- 메모 카드 기울기 제거
- 메모 이동을 마우스 포인터 추적 방식으로 변경(완료모드에서만 이동)
- 메모 리사이즈 버튼 제거, 카드 보더 드래그(`resize: both`)로 변경
- 메모 에디터(무료 에디터 React Quill) 영역 가로 스크롤 제거 및 줄바꿈 안정화
- 에디터 툴바를 카드 하단에서 더 이격 배치하고 2줄(랩) 레이아웃 적용
- 메모 노출순서는 우클릭 컨텍스트 메뉴로만 변경
- 메모 툴바 초기 위치를 캔버스 중앙 하단으로 보정
- 메모 툴바를 둥근 직사각형 + 좌측 드래그 핸들 아이콘 구조로 개편
- 툴바 드래그 좌표를 `top/left` 기준으로 변경해 상하 반전 문제 해결
- API 메시지 토스트는 우하단만 사용, 자동 소멸 유지
- 저장중 표시도 우하단으로 이동해 중앙 중복 표시 제거

## 검증 결과
- `npm run build`: PASS
- `npm run test`: PASS
- 실 API 회귀: PASS (`/boards/{id}/move`)
