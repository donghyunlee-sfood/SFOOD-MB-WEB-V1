# Iteration 01 UI Fix Report (09)

## 작성일
- 2026-03-03

## 분석 내용
- 메모 툴바에서 생성한 메모가 고정 좌표(좌상단 근처)로 생성되어 작업 흐름과 거리감이 큼
- 기본 메모 스타일에 라운드가 남아 있어 직사각형 요구와 불일치

## 수정 파일
- `src/pages/MainPage.tsx`
- `src/components/MemoCard.tsx`
- `docs/test/results/iteration-01-test-result.md`

## 수정 결과
- 메모 생성 위치를 캔버스 현재 뷰포트 중앙 기준으로 계산해 생성하도록 변경
  - `scrollLeft/scrollTop`, 캔버스 가시 영역, 줌 배율을 함께 반영
- 기본 메모 타입(`basic`)의 `border-radius`를 `0px`로 변경해 직각 스타일로 고정

## 검증 결과
- `npm run build`: PASS
- `npm run test`: PASS
