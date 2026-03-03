# Iteration 01 UI Fix Report (02)

## 작성일
- 2026-03-03

## 분석 내용
- LNB 보드 생성/수정이 브라우저 팝업(prompt)에 의존해 UX 일관성이 깨짐
- 보드 트리는 계층 렌더였지만 드래그 이동이 사실상 하위 편입으로만 동작해 위치 이동 요구와 불일치
- 메모 툴바가 툴바 느낌보다 버튼 나열에 가까워 식별성이 낮음
- 메모 에디터 툴바와 카드가 겹쳐 보이며 완료/편집 모드 전환 규칙이 약함
- 동일 메시지 반복 시 토스트 상태 변경이 누락될 가능성이 있어 피드백이 불안정함

## 수정 파일
- `src/pages/MainPage.tsx`
- `src/pages/LoginPage.tsx`
- `src/components/BoardTree.tsx`
- `src/components/MemoCard.tsx`
- `src/components/MemoToolbar.tsx`
- `src/components/MemoEditorToolbar.tsx`
- `src/components/Icon.tsx`
- `src/store/uiStore.ts`
- `src/styles/app.css`
- `src/main.tsx`
- `package.json`, `package-lock.json` (무료 에디터 의존성)

## 수정 결과
- LNB 최상위 보드는 `+` 클릭 시 인라인 입력 폼으로만 생성되도록 변경
- 하위 보드 생성/보드명 수정도 인라인 폼으로 통일
- 보드 이동은 드롭 위치(위/아래) 기준으로 같은 레벨 내 위치 이동되도록 보정
- 최상위 이동 전용 섹션 삭제 유지
- 사용자 정보/로그아웃 영역을 LNB 하단 공간에 맞춰 재배치
- 메모 툴바를 가로형 플로팅 툴바로 변경하고 아이콘+이름을 함께 노출
- 메모 타입 클릭 시 즉시 메모 생성 동작 보장
- 메모 에디터를 무료 오픈소스 에디터(React Quill) 기반으로 교체
- 메모 에디터 툴바를 카드 하단에서 더 아래로 이격 배치해 겹침 완화
- 메모 노출 순서 변경을 우클릭 컨텍스트 메뉴로 제공
- 메모는 완료모드에서만 드래그 이동 가능
- 포커스가 메모 외부로 이동하면 완료모드로 저장되도록 처리
- API 결과 메시지는 우하단 토스트로 표시되고 자동으로 사라지도록 보정

## 검증 결과
- `npm run build`: PASS
- `npm run test`: PASS
- 실주소 API 회귀(curl): PASS
