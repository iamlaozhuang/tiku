# Record content_admin AI Provider approval package decision plan

**Task id:** `record-content-admin-ai-provider-approval-package-decision`
**Date:** 2026-06-21
**Branch:** `codex/content-ai-provider-approval-package-decision`

## Scope

Record the user's option B decision: prepare a docs-only Provider/env/cost approval package for future `content_admin`
AI work. This task must not approve or execute real Provider calls.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Edit Plan

1. Register the task in `project-state.yaml` and `task-queue.yaml`.
2. Add the Provider approval package preparation decision to the content_admin AI scope decision document.
3. Create evidence and audit review records.
4. Run scoped docs validation and Module Run v2 gates.
5. Commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch.

## Risk Boundary

No source, tests, schema, migration, package, lockfile, `.env`, secret, Provider configuration, real Provider call,
prompt/provider payload, raw generated content evidence, database connection, dev server, browser/e2e, deployment, PR,
force-push, payment, external service, or Cost Calibration Gate work is allowed.
