const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function randomToken(length = 10, random = Math.random) {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    const pick = Math.floor(random() * RANDOM_CHARS.length);
    value += RANDOM_CHARS[pick];
  }
  return value;
}

export function makeBoardId(userEmail, random = Math.random) {
  return `${userEmail}_${randomToken(10, random)}`;
}

export function makeMemoId(boardId, random = Math.random) {
  return `${boardId}_${randomToken(10, random)}`;
}

export function validateBoardName(name) {
  if (!name || !name.trim()) {
    return "보드명은 비어 있을 수 없습니다.";
  }
  if (name.length > 20) {
    return "보드명은 20자를 초과할 수 없습니다.";
  }
  return null;
}

export function rollbackMemo(memos, previousMemo) {
  return memos.map((memo) => (memo.memoId === previousMemo.memoId ? previousMemo : memo));
}

export function clampZoom(value, min = 0.6, max = 2) {
  return Math.min(max, Math.max(min, value));
}

export function nextZoom(currentZoom, wheelDeltaY) {
  const delta = wheelDeltaY < 0 ? 0.1 : -0.1;
  return Number(clampZoom(currentZoom + delta).toFixed(2));
}

export function centerMemoPosition({ scrollLeft, scrollTop, clientWidth, clientHeight, zoom, width, height }) {
  const posX = Math.max(0, (scrollLeft + clientWidth / 2) / zoom - width / 2);
  const posY = Math.max(0, (scrollTop + clientHeight / 2) / zoom - height / 2);
  return { posX: Math.round(posX), posY: Math.round(posY) };
}

export function formatErrorMessage(error, fallback = "알 수 없는 오류가 발생했습니다.") {
  if (!error) {
    return fallback;
  }
  const message = typeof error === "string" ? error : error.message;
  if (!message || !message.trim()) {
    return fallback;
  }
  if (/Failed to fetch/i.test(message)) {
    return "네트워크 연결을 확인해주세요.";
  }
  return message;
}
