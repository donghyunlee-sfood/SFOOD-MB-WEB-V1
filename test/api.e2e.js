const API_BASE = process.env.API_BASE || 'http://127.0.0.1:8080/api/v1';

function makeUserToken() {
  const seed = Date.now();
  const email = `api.e2e.${seed}@example.com`;
  return `${email}|API E2E ${seed}|`;
}

function extractCookie(headers) {
  const raw = headers.get('set-cookie');
  if (!raw) {
    return '';
  }
  return raw.split(';')[0];
}

async function request(path, options = {}, cookie = '') {
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_error) {
    payload = null;
  }
  return { response, payload, text };
}

(async () => {
  const token = makeUserToken();
  let cookie = '';

  const boardId = `b_${Date.now()}_e2e`;
  const memoId = `${boardId}_m1`;

  const results = [];
  const richHtml = '<p><input type="checkbox" checked> item 1</p><p><br></p><p><input type="checkbox"> item 2</p><ul><li>alpha</li><li>beta</li></ul>';

  async function run(step, path, method, body, expectedStatuses = [200]) {
    try {
      const { response, payload, text } = await request(path, { method, body }, cookie);
      cookie = extractCookie(response.headers) || cookie;
      const ok = expectedStatuses.includes(response.status) && payload && payload.success === true;
      results.push({
        step,
        method,
        path,
        status: response.status,
        success: ok,
        message: payload && payload.message ? payload.message : (text || '').slice(0, 160)
      });
    } catch (error) {
      results.push({
        step,
        method,
        path,
        status: 'ERR',
        success: false,
        message: error && error.message ? error.message : String(error)
      });
    }
  }

  await run('Login', '/auth/login', 'POST', { googleToken: token });
  await run('Me', '/auth/me', 'GET');
  await run('GetBoards', '/boards', 'GET');
  await run('CreateBoard', '/boards', 'POST', {
    boardId,
    parentBoardId: null,
    boardName: 'E2E Board',
    sortOrder: 101
  });
  await run('RenameBoard', `/boards/${encodeURIComponent(boardId)}/name`, 'PATCH', { boardName: 'E2E Board Renamed' });
  await run('MoveBoard', `/boards/${encodeURIComponent(boardId)}/move`, 'PATCH', { parentBoardId: null, sortOrder: 102 });
  await run('MemoTypes', '/memo-types', 'GET');
  await run('CreateMemo', `/boards/${encodeURIComponent(boardId)}/memos`, 'POST', {
    memoId,
    typeId: 'TYPE_BASIC',
    content: 'e2e memo',
    posX: 210,
    posY: 145,
    width: 320,
    height: 200,
    zIndex: 2
  });
  await run('GetMemos', `/boards/${encodeURIComponent(boardId)}/memos`, 'GET');
  await run('UpdateMemoContent', `/memos/${encodeURIComponent(memoId)}/content`, 'PATCH', { content: richHtml });
  const verifyAfterContent = await request(`/boards/${encodeURIComponent(boardId)}/memos`, { method: 'GET' }, cookie);
  const savedContent = verifyAfterContent.payload && verifyAfterContent.payload.data && verifyAfterContent.payload.data[0]
    ? verifyAfterContent.payload.data[0].content
    : '';
  const contentOk = typeof savedContent === 'string' && savedContent.includes('input type="checkbox"');
  results.push({
    step: 'VerifyMemoContentHtml',
    method: 'GET',
    path: `/boards/${encodeURIComponent(boardId)}/memos`,
    status: verifyAfterContent.response.status,
    success: contentOk,
    message: contentOk ? 'checkbox html persisted' : `content mismatch: ${String(savedContent).slice(0, 180)}`
  });
  await run('UpdateMemoPosition', `/memos/${encodeURIComponent(memoId)}/position`, 'PATCH', { posX: 300, posY: 220 });
  await run('UpdateMemoSize', `/memos/${encodeURIComponent(memoId)}/size`, 'PATCH', { width: 360, height: 240 });
  await run('UpdateMemoZIndex', `/boards/${encodeURIComponent(boardId)}/memos/zindex`, 'PATCH', { memos: [{ memoId, zIndex: 5 }] });
  await run('DeleteMemo', `/memos/${encodeURIComponent(memoId)}`, 'DELETE');
  await run('DeleteBoard', `/boards/${encodeURIComponent(boardId)}`, 'DELETE');
  await run('Logout', '/auth/logout', 'POST');

  const failed = results.filter((r) => !r.success);

  console.log('API E2E RESULT:', failed.length ? 'FAIL' : 'PASS');
  for (const row of results) {
    console.log(`- ${row.success ? 'PASS' : 'FAIL'} [${row.status}] ${row.method} ${row.path} (${row.step})`);
    if (!row.success) {
      console.log(`  message: ${row.message}`);
    }
  }

  if (failed.length) {
    process.exitCode = 1;
  }
})();
