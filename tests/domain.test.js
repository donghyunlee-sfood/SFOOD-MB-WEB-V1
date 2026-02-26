import test from "node:test";
import assert from "node:assert/strict";
import {
  centerMemoPosition,
  clampZoom,
  formatErrorMessage,
  makeBoardId,
  makeMemoId,
  nextZoom,
  rollbackMemo,
  validateBoardName
} from "../src/domain.js";

test("validateBoardName returns error for empty names", () => {
  assert.equal(validateBoardName(""), "보드명은 비어 있을 수 없습니다.");
  assert.equal(validateBoardName("   "), "보드명은 비어 있을 수 없습니다.");
});

test("validateBoardName returns error for names longer than 20 chars", () => {
  assert.equal(validateBoardName("123456789012345678901"), "보드명은 20자를 초과할 수 없습니다.");
});

test("makeBoardId and makeMemoId compose identifier prefixes", () => {
  const fixedRandom = () => 0;
  const boardId = makeBoardId("user@test.com", fixedRandom);
  const memoId = makeMemoId(boardId, fixedRandom);
  assert.match(boardId, /^user@test\.com_/);
  assert.match(memoId, new RegExp(`^${boardId}_`));
});

test("rollbackMemo restores previous memo state", () => {
  const before = [
    { memoId: "memo-1", content: "old content" },
    { memoId: "memo-2", content: "another" }
  ];
  const mutated = [
    { memoId: "memo-1", content: "new content" },
    { memoId: "memo-2", content: "another" }
  ];
  const rolled = rollbackMemo(mutated, before[0]);
  assert.deepEqual(rolled, before);
});

test("clampZoom and nextZoom respect boundaries", () => {
  assert.equal(clampZoom(0.4), 0.6);
  assert.equal(clampZoom(2.4), 2);
  assert.equal(nextZoom(1, -100), 1.1);
  assert.equal(nextZoom(0.6, 100), 0.6);
});

test("centerMemoPosition calculates center coordinates with zoom", () => {
  const centered = centerMemoPosition({
    scrollLeft: 100,
    scrollTop: 50,
    clientWidth: 800,
    clientHeight: 600,
    zoom: 1,
    width: 300,
    height: 200
  });
  assert.deepEqual(centered, { posX: 350, posY: 250 });
});

test("formatErrorMessage normalizes unknown and network errors", () => {
  assert.equal(formatErrorMessage(null), "알 수 없는 오류가 발생했습니다.");
  assert.equal(formatErrorMessage(new Error("Failed to fetch")), "네트워크 연결을 확인해주세요.");
  assert.equal(formatErrorMessage(new Error("custom error")), "custom error");
});
