# close-redeem-code-audit-redaction

## Scope

- Task: task 11 in the 2026-06-21 low-risk audit closeout batch.
- Branch: `codex/close-redeem-code-audit-redaction`.
- Base: `ed7f49e7652fcc3af713a2e0a35ef4ff2a0ff1b4`.
- Target: extend the local `redeem_code` reference read model with explicit audit_log and ai_call_log redaction status.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- security-best-practices server logging/redaction guidance loaded earlier in this batch.

## Constraints

- Do not expose plaintext `redeem_code`, hashes, Provider payload, raw prompt, raw answer, token, database URL, raw row, publicId inventory, or internal numeric id.
- Do not change schema, migration, seed, package files, `.env*`, Provider execution, dev server, browser, e2e, or database runtime data.
- Keep this as local contract/service/test work; no real log storage write or AI call.

## Implementation Plan

1. Add failing focused unit assertions for an explicit `auditRedaction` object on `RedeemCodeReferenceDto`.
2. Extend the `redeem-code-reference` contract with audit_log and ai_call_log redaction status fields.
3. Populate the new read-model fields in `buildRedeemCodeReferenceReadModel`.
4. Run focused related redaction tests, lint, typecheck, diff, Prettier, and Module Run v2 gates.

## Risks

- Redaction status can become a vague boolean. Use explicit small string statuses instead.
- Evidence can accidentally include sensitive fixture markers. Evidence will describe results only and avoid quoting sensitive values.
