# Development Rules (WEB)

## Scope
- Apply to frontend code in this repository.
- Follow module separation: `api` / `state` / `ui` responsibilities.

## Coding Standards
- Keep API request and DOM rendering logic separated.
- Use a single API client with shared error handling.
- Keep IDs and endpoint contracts aligned with APP API spec.
- Do not silently swallow API failures; show user-visible errors.

## Validation
- Validate required form inputs before API call.
- Keep board name max length 20 on client-side as well.

## Security
- Session-cookie auth only.
- Always send credentials with API requests.

## UX
- Mobile-first responsive layout.
- Keep color and spacing tokens centralized in CSS variables.
- Avoid generic template UI; keep clear visual hierarchy.
