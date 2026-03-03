import { useEffect } from "react";

function App() {
  useEffect(() => {
    import("./main.js");
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Memo Board</h1>
          <p className="subtitle">APP API connected web client</p>
        </div>
        <div className="auth-actions">
          <button id="btn-me" className="btn ghost">Me</button>
          <button id="btn-logout" className="btn ghost">Logout</button>
        </div>
      </header>

      <main className="layout">
        <section className="panel auth-panel">
          <h2>Login</h2>
          <label>User ID <input id="login-user-id" type="text" placeholder="user@example.com" /></label>
          <label>Name <input id="login-name" type="text" placeholder="User One" /></label>
          <label>Google Token <input id="login-token" type="text" placeholder="token-for-user" /></label>
          <button id="btn-login" className="btn primary">Manual Login</button>

          <div className="divider">Google OAuth</div>
          <label>Google Client ID <input id="google-client-id" type="text" placeholder="Google OAuth Client ID" value="720537531905-4srngg493kr4k2ql4d17e1pq3tvbiick.apps.googleusercontent.com" readOnly /></label>
          <div className="row">
            <button id="btn-google-init" className="btn ghost">Init Google</button>
            <button id="btn-google-login" className="btn primary">Google Login</button>
          </div>
          <div id="google-render" className="google-slot"></div>
          <div id="google-info" className="hint"></div>

          <button id="btn-process-check" className="btn ghost">Check User Create Flow</button>
          <div id="auth-info" className="hint"></div>
        </section>

        <section className="panel board-panel">
          <h2>Boards</h2>
          <div className="row">
            <input id="board-id" type="text" placeholder="board-id" />
            <button id="btn-board-auto-id" className="btn ghost">Auto ID</button>
            <input id="board-name" type="text" placeholder="board name (max 20)" maxLength="20" />
          </div>
          <div className="row">
            <button id="btn-board-create" className="btn primary">Create Board</button>
            <button id="btn-board-list" className="btn ghost">Refresh</button>
          </div>
          <ul id="board-list" className="list"></ul>
        </section>

        <section className="panel memo-panel">
          <h2>Memos</h2>
          <div className="row">
            <button id="btn-type-list" className="btn ghost">Load Memo Types</button>
          </div>
          <div id="memo-types" className="chips"></div>

          <div className="row">
            <input id="memo-id" type="text" placeholder="memo-id" />
            <button id="btn-memo-auto-id" className="btn ghost">Auto ID</button>
            <input id="memo-content" type="text" placeholder="memo content" />
          </div>
          <div className="row">
            <input id="memo-x" type="number" placeholder="x" defaultValue="10" />
            <input id="memo-y" type="number" placeholder="y" defaultValue="20" />
            <input id="memo-width" type="number" placeholder="width" defaultValue="320" />
            <input id="memo-height" type="number" placeholder="height" defaultValue="240" />
            <input id="memo-z" type="number" placeholder="zIndex" defaultValue="1" />
          </div>
          <div className="row">
            <button id="btn-memo-create" className="btn primary">Create Memo</button>
            <button id="btn-memo-list" className="btn ghost">Refresh Memos</button>
          </div>
          <ul id="memo-list" className="list"></ul>
        </section>
      </main>

      <footer className="statusbar">
        <span id="status-message">Ready</span>
        <span id="error-message"></span>
      </footer>
    </div>
  );
}

export default App;
