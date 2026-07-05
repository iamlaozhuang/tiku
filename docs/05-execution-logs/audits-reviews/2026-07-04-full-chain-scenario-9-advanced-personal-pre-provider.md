# 2026-07-04 Full-Chain Scenario 9 Advanced Personal Pre-Provider Audit

Status: blocked

## Adversarial Review

- Read gate covers advanced authorization, redeem_code, AI generation SSOT, Provider/Cost boundary, Scenario 7/8 evidence, source, tests, and Playwright instructions: pass
- Scenario 9 did not run browser/e2e after source contract review found a likely state-polluting path: pass
- No private credential or plaintext card value was used: pass
- No DB connection, direct mutation, product mutation, schema, migration, seed, dependency, Provider, staging/prod, or Cost action occurred: pass
- Stop-on-fail was applied before card consumption: pass
- Required contract is not downgraded: `edition_upgrade` must create `auth_upgrade` and must not create a second `personal_auth`: pass
- Evidence excludes credentials, phone/email, connection strings, tokens, sessions, cookies, localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI I/O, full content, and plaintext card values: pass

## Risk

- If Scenario 9 were run before repair, the upgrade selector could be consumed into an invalid authorization shape and pollute downstream advanced learner evidence.
- Repair must avoid schema changes unless a separate task proves they are necessary; current schema already has `redeem_code_type` and `auth_upgrade`.
- Repair must not bypass authorization by computing advanced capability from UI state.

## Review Result

Blocked with a narrow repair path. The safe restart point after repair is Scenario 9 pre-runtime/browser login node, not Scenario 8.
