const test = require('node:test');
const assert = require('node:assert/strict');

require('../src/core');
require('../src/api');

test('ApiClient encodes path params for board and memo endpoints', async () => {
  const seen = [];
  const bodies = [];
  const originalFetch = global.fetch;

  global.fetch = async (url, options = {}) => {
    seen.push(url);
    bodies.push(options.body || null);
    return {
      status: 200,
      ok: true,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ success: true, data: {} })
    };
  };

  try {
    const client = new global.MemoApi.ApiClient('/api/v1');
    await client.renameBoard('board#1%2', 'abc');
    await client.updateMemoContent('memo#x%y', '<p>x</p>', {});

    assert.equal(seen[0], '/api/v1/boards/board%231%252/name');
    assert.equal(seen[1], '/api/v1/memos/memo%23x%25y/content');
  } finally {
    global.fetch = originalFetch;
  }
});

test('ApiClient sends memo content payload as raw HTML string', async () => {
  const bodies = [];
  const originalFetch = global.fetch;
  const html = '<p><input type="checkbox" checked> item 1</p><p><br></p><p><input type="checkbox"> item 2</p>';

  global.fetch = async (_url, options = {}) => {
    bodies.push(options.body || null);
    return {
      status: 200,
      ok: true,
      headers: { get: () => 'application/json' },
      text: async () => JSON.stringify({ success: true, data: {} })
    };
  };

  try {
    const client = new global.MemoApi.ApiClient('/api/v1');
    await client.updateMemoContent('memo-1', html, { textColor: '#000000' });
    const payload = JSON.parse(String(bodies[0] || '{}'));
    assert.equal(payload.content, html);
  } finally {
    global.fetch = originalFetch;
  }
});
