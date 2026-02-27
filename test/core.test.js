const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../src/core');

test('generateBoardId prefixes account id and token length is 10', () => {
  const id = core.generateBoardId('user@example.com', () => 0);
  assert.match(id, /^user@example\.com_[A-Za-z0-9]{10}$/);
  assert.equal(id.split('_')[1].length, 10);
});

test('generateMemoId prefixes board id and token length is 10', () => {
  const id = core.generateMemoId('board_123', () => 0.1);
  assert.equal(id.split('_').length, 3);
  assert.equal(id.split('_')[2].length, 10);
});

test('validateBoardName rejects empty and too long names', () => {
  assert.equal(core.validateBoardName('   ').valid, false);
  assert.equal(core.validateBoardName('x'.repeat(21)).valid, false);
  assert.equal(core.validateBoardName('Valid Name').valid, true);
});

test('buildBoardTree and flattenBoardTree keep hierarchy order', () => {
  const boards = [
    { boardId: 'a', parentBoardId: null, sortOrder: 1, isHide: false },
    { boardId: 'b', parentBoardId: 'a', sortOrder: 1, isHide: false },
    { boardId: 'c', parentBoardId: null, sortOrder: 2, isHide: false }
  ];
  const tree = core.buildBoardTree(boards);
  const rows = core.flattenBoardTree(tree);
  assert.deepEqual(rows.map((r) => `${r.board.boardId}:${r.depth}`), ['a:0', 'b:1', 'c:0']);
});

test('applyZOrder front-most and back-most', () => {
  const memos = [
    { memoId: 'm1', zIndex: 1, isHide: false },
    { memoId: 'm2', zIndex: 2, isHide: false },
    { memoId: 'm3', zIndex: 3, isHide: false }
  ];
  core.applyZOrder(memos, 'm1', 'front-most');
  assert.deepEqual(memos.map((m) => `${m.memoId}:${m.zIndex}`), ['m1:3', 'm2:1', 'm3:2']);
  core.applyZOrder(memos, 'm1', 'back-most');
  assert.deepEqual(memos.map((m) => `${m.memoId}:${m.zIndex}`).sort(), ['m1:1', 'm2:2', 'm3:3']);
});

test('clampZoom keeps range between 0.5 and 2', () => {
  assert.equal(core.clampZoom(0.2), 0.5);
  assert.equal(core.clampZoom(3), 2);
  assert.equal(core.clampZoom(1.234), 1.23);
});

test('generated random token is URL-safe alphanumeric', () => {
  const token = core.generateRandomToken(32);
  assert.match(token, /^[A-Za-z0-9]{32}$/);
});
