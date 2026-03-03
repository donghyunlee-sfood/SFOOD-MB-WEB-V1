# Iteration 01 UI Fix Report (07)

## 작성일
- 2026-03-03

## 분석 내용
- 메모 타입별 모양 차이가 약하거나 조건 매핑이 불명확해 동일하게 보임
- 컨텍스트 메뉴가 메모 컨테이너 내부에서 렌더되어 좌표와 레이어 우선순위 문제가 발생
- 메모 에디터 툴바가 메모 내부 컨테이너 클리핑 영향으로 보이지 않는 케이스 존재

## 수정 파일
- `src/components/MemoCard.tsx`
- `src/components/MemoContextMenu.tsx`
- `src/pages/MainPage.tsx`
- `src/styles/app.css`
- `docs/test/results/iteration-01-test-result.md`

## 수정 결과
- 메모 타입 스타일을 `memoTypes` 순서 기준으로 고정 매핑:
  - 1번째: 직사각형(`basic`)
  - 2번째: 둥근 사각형(`rounded`)
  - 3번째: 그림자형(`shadow`)
- 컨텍스트 메뉴를 `MemoContextMenu` 컴포넌트로 분리하고 `createPortal(document.body)`로 렌더
- 컨텍스트 메뉴 좌표를 마우스 포인터 `clientX/clientY` 기준으로 고정, 최상위 레이어(`z-index: 9999`) 적용
- 에디터 툴바를 메모 하단 10px 외부 위치(`top: calc(100% + 10px)`)에 표시
- 메모 카드 `overflow: visible`로 전환해 툴바/외부 UI가 잘리지 않도록 조정

## 검증 결과
- `npm run build`: PASS
- `npm run test`: PASS
