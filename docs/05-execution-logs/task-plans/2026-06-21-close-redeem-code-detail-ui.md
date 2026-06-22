# close-redeem-code-detail-ui

## Scope

- Task: task 10 in the 2026-06-21 low-risk audit closeout batch.
- Branch: `codex/close-redeem-code-detail-ui`.
- Base: `883bcd96832faac04446bf7e90230c532c1f9b50`.
- Target: make the admin `redeem_code` detail UI consume the redacted detail route contract from task 9.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`

## Constraints

- Do not render plaintext `redeem_code`, hashes, secrets, tokens, raw rows, or internal numeric ids.
- Do not change schema, migration, seed, package files, `.env*`, Provider code, dev server, browser, e2e, or database runtime data.
- Keep UI state and copy token-driven and consistent with existing admin operation page patterns.
- Use the existing local unit test harness only.

## Implementation Plan

1. Add a failing UI assertion that opening a redeem_code detail calls `/api/v1/redeem-codes/{publicId}` and renders detail-only redacted fields.
2. Import the detail contract type and add selected detail/loading state.
3. Add a `handleViewRedeemCodeDetail` function that fetches the detail route with the stored admin session token.
4. Update `RedeemCodeDetailPanel` to render `RedeemCodeDetailDto` fields and redaction metadata.
5. Run focused UI tests, lint, typecheck, diff, Prettier, and Module Run v2 gates.

## Risks

- UI could continue to rely on stale list summary instead of task 9 detail contract. Focused tests must assert the detail route fetch.
- Detail panel could accidentally display plaintext or internal ids from mock payloads. Tests must assert sensitive markers are absent.
- Evidence must remain redacted and avoid quoting plaintext card values or tokens.
