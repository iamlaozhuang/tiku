# 2026-07-04 Full-Chain Scenario 10 Standard Employee Learning Rerun After Practice Start Idempotency Repair Audit

Status: blocked

## Adversarial Review Checklist

- Current task pointer is aligned before runtime/preflight: pass
- Restart point is browser login and standard employee learning node, not employee import: pass
- Practice start idempotency source repair is closed before rerun: pass
- Selector/DB target/content preflight passes before browser/runtime: blocked by leftover duplicate active practice state
- Browser login waits for hydrated/interactable readiness before private credential fill: not_started_due_preflight_block
- Product DB writes do not happen before browser login smoke: pass_no_browser_runtime
- Standard employee does not trigger Provider, AI generation submit, staging/prod, or Cost: pass_not_started
- Evidence remains redacted: pass
- Closeout gates passed on final blocked workset: pass

## Stop-On-Fail Review

Stop and split a narrower task if preflight or runtime shows DB target mismatch, missing selector input, missing standard org authorization, missing matching `marketing:3` content, leftover duplicate active practice state requiring provisioning, login failure, permission bypass, redaction risk, source/test repair need, schema/migration/seed need, Provider/staging/prod/Cost need, destructive DB operation, or employee import repeat requirement.

## Review Result

Task is blocked during selector/DB preflight. No browser/runtime was started. The next required task is selector-scoped non-delete duplicate active practice state provisioning, followed by another Scenario 10 rerun from browser login and standard learning node.
