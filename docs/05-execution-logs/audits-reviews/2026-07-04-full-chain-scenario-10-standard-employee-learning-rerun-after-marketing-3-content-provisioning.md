# 2026-07-04 Full-Chain Scenario 10 Standard Employee Learning Rerun After Marketing 3 Content Provisioning Audit

Status: blocked

## Adversarial Review Checklist

- Current task pointer is aligned before runtime/preflight: pass
- Restart point is browser login and standard employee learning node, not employee import: pass
- Selector/DB target/content preflight passed before browser/runtime: pass
- Private standard employee import input is used only as in-memory login input and not as a repeat import: pass
- Browser login must wait for hydrated/interactable readiness before private credential fill: pass
- Product DB writes must not happen before browser login smoke: pass
- Standard employee must create only standard learning data and not trigger Provider, AI generation submit, staging/prod, or Cost: blocked by duplicate active practice aggregate; Provider/AI submit count remains zero
- Standard employee must not access `企业训练` or advanced AI surfaces: pass
- Evidence remains redacted: pass
- No source/test/dependency/schema/migration/seed change occurs in this runtime rerun task: pass
- Scoped Prettier, whitespace, blocked path diff, Module Run v2 pre-commit, and Module Run v2 pre-push gates passed on the final S10 blocked workset: pass

## Stop-On-Fail Review

Stop and split a narrower task if preflight or runtime shows missing selector input, DB target mismatch, login failure, missing standard org authorization, missing matching `marketing:3` published content, permission bypass, redaction risk, source/test repair need, schema/migration/seed need, Provider/staging/prod/Cost need, destructive DB operation, or employee import repeat requirement.

## Review Result

Task is blocked, not passed. Runtime proved browser login readiness and standard employee surface boundaries, but selector-scoped aggregate verification found duplicate active `practice` rows for the same selected standard employee and selected `marketing:3` paper after one UI learning flow. This requires `full-chain-scenario-10-practice-start-idempotency-repair-2026-07-04`, followed by a Scenario 10 rerun from the affected browser login / standard learning node.

No employee import repeat, Provider/staging/prod/Cost, schema/migration/seed/dependency change, product source change, destructive DB action, release readiness, final Pass, production usability, raw DOM/screenshot/trace, raw DB rows, credentials, tokens, sessions, cookies, headers, private values, or full content evidence was produced.
