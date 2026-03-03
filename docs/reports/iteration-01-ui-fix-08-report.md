# Iteration 01 UI Fix Report (08)

## 작성일
- 2026-03-03

## 분석 내용
- 토스트 메시지 가시성이 낮아 사용자에게 피드백이 전달되지 않는 구간 존재
- 사용자 질의 메시지(삭제 확인)는 브라우저 기본 `confirm`을 사용해 디자인/일관성 부족
- 메모 툴바 높이가 커서 캔버스 작업 영역을 과도하게 점유
- 메모 편집 모드 진입 시 저장된 폰트 크기/색상 정보가 복원되지 않음
- 브라우저 기본 스타일이 일부 컴포넌트 외관에 혼입

## 수정 파일
- `src/components/ConfirmDialog.tsx`
- `src/pages/MainPage.tsx`
- `src/components/MemoCard.tsx`
- `src/styles/app.css`
- `docs/test/results/iteration-01-test-result.md`

## 수정 결과
- 사용자 질의 팝업을 중앙 모달 UI(`ConfirmDialog`)로 추가
- 보드 삭제/메모 삭제 동작을 중앙 확인 팝업 승인 후 실행하도록 변경
- 토스트 팝업에 `z-index`/테두리 스타일을 추가해 우측 하단 노출 가시성 강화
- CSS 리셋을 추가해 기본 브라우저 스타일 영향 제거
- 메모 툴바 높이 및 버튼 크기를 축소(작업영역 확보)
- 메모 편집 시작 시 저장된 스타일(`font-family`, `font-size`, `color`) 파싱/복원
- 편집 중 Quill 루트 스타일을 실시간 동기화해 폰트 크기/색상 적용 유지

## 검증 결과
- `npm run build`: PASS
- `npm run test`: PASS
