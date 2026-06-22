# close-redeem-code-detail-contract

## Scope

- Task: task 9 in the 2026-06-21 low-risk audit closeout batch.
- Branch: `codex/close-redeem-code-detail-contract`.
- Base: `8142dc9be618543480ba56c0e546522c19111a0d`.
- Target: add a redacted `redeem_code` detail contract and route by `publicId`.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/03-standards/glossary.yaml`

## Constraints

- Do not expose plaintext `redeem_code`, hashes, secrets, database URLs, raw rows, or internal numeric ids in response, logs, or evidence.
- Do not change schema, migration, seed, dependency files, `.env*`, provider code, or database runtime data.
- Keep runtime authorization server-side and reuse the existing admin session/role boundary.
- Use `/api/v1/redeem-codes/{publicId}` style route and camelCase JSON fields.

## Implementation Plan

1. Add focused unit tests for detail authorization, redacted DTO shape, not found behavior, and no-store response.
2. Add `RedeemCodeDetailDto` / result contract fields that extend the existing redacted summary without plaintext.
3. Add repository detail lookup by `publicId`, mapping internal ids only inside the repository and returning public ids.
4. Add runtime detail handler under `redeemCodes.detail.GET` with publicId validation and standard response envelope.
5. Add Next route file for `/api/v1/redeem-codes/[publicId]`.
6. Run focused unit, lint, typecheck, diff, Prettier, Module Run v2 precommit/prepush; record redacted evidence.

## Risks

- Detail data may accidentally include internal ids or sensitive code fields. Tests must serialize the payload and assert those names/markers are absent.
- Route handler may skip admin authorization. Tests must cover denied role and authenticated access.
- Evidence may capture sensitive fixtures. Evidence will record command summaries only, without plaintext code values.
