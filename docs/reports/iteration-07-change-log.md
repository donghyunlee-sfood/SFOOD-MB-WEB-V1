# Iteration 07 Change Log (WEB)

## Added
- `index.html` (Vite root entry)
- `vite.config.mjs`
- `src/App.jsx`
- `src/main.jsx`
- `docs/plan/iteration/iteration-07-plan.md`
- `docs/test/results/iteration-07-test-result.md`
- `docs/reports/iteration-07-result.md`
- `docs/reports/iteration-07-change-log.md`

## Updated
- `package.json`
  - added scripts: `dev`, `build`, `preview`
  - updated `ui:serve` to Vite server
  - added dependencies: `react`, `react-dom`, `vite`, `@vitejs/plugin-react`
- `package-lock.json`
  - regenerated for new dependencies
- `scripts/smoke-test.js`
  - updated required files for Vite+React structure
- `README.md`
  - run/test commands switched to `npm run dev` flow
