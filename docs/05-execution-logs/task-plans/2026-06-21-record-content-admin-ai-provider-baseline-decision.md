# Record content_admin AI Provider baseline decision plan

**Task id:** `record-content-admin-ai-provider-baseline-decision`
**Date:** 2026-06-21
**Branch:** `codex/content-ai-provider-baseline-decision`

## Scope

Record the user's option A decision for the content_admin AI Provider approval package baseline: use ADR-006's installed
AI SDK baseline, with `@ai-sdk/alibaba`/Qwen as the preferred candidate and `@ai-sdk/openai-compatible` as a fallback
candidate.

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
2. Add the Provider candidate baseline decision to the content_admin AI scope decision document.
3. Record evidence and audit review.
4. Run scoped docs validation and Module Run v2 gates.
5. Commit, fast-forward merge to `master`, push `origin/master`, and clean the short branch.

## Risk Boundary

This is a docs-only approval-package baseline. It does not approve real Provider calls, prompt/provider payload exposure,
raw generated content evidence, model output persistence, `.env` reads or writes, secret creation, Provider
configuration changes, source implementation, schema, migration, seed, database connection, package or lockfile change,
browser/e2e/dev-server runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate work.
