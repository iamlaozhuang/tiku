# 2026-06-22 Local Release Candidate Evidence Packet

## Task

- Task ID: `local-release-candidate-evidence-packet-2026-06-22`
- Branch: `codex/local-release-candidate-evidence-packet-20260622`
- Scope: docs/state-only local release-candidate static evidence packet.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-checklist.yaml`
- `docs/04-agent-system/state/preview-owner-acceptance-naming-packet.yaml`
- `package.json` script inventory, read-only.

## Plan

1. Register a docs/state-only local release-candidate evidence packet.
2. Record static gate execution for `lint`, `typecheck`, `git diff --check`, git inventory, package script inventory, queue status, and redaction checklist.
3. Record unit/build script availability without running aggregate `test`, e2e/browser, dev server, Provider, env, schema/db, deployment, or cloud actions.
4. Keep the active terminal recovery window slim by archiving the oldest displaced terminal task into the monthly archive and history index.
5. Run Module Run v2 hardening and closeout checks before commit, then fast-forward merge to `master`, push `origin/master`, and clean the merged short branch.

## Boundaries

- No source, test, e2e, package, lockfile, schema, migration, drizzle, script, env, Provider, deploy, browser, or dev-server changes.
- `npm run test` is not run because it chains to `test:e2e`.
- `npm run build` is not run in this packet; build script availability is recorded for later fresh execution if requested.
- Preview remains not ready; AP-01 through AP-11 remain release gates.
- Cost Calibration Gate remains blocked.

## Risk Controls

- Evidence is command/result summary only.
- No secret, token, database URL, Authorization header, raw prompt, provider payload, raw generated content, raw employee answer, plaintext `redeem_code`, or full paper content is recorded.
- Any runtime publication, staging resource action, browser/e2e, Provider, env/secret, schema/db, dependency, deploy, PR, force-push, payment, external-service, org_auth runtime, or Cost Calibration Gate action requires separate fresh approval.
