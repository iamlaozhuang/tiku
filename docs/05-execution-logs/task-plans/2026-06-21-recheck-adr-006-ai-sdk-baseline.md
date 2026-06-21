# Recheck ADR-006 AI SDK Baseline Plan

**Date:** 2026-06-21
**Task id:** `recheck-adr-006-ai-sdk-baseline`
**Branch:** `codex/recheck-adr-006-ai-sdk-baseline`
**Scope:** docs-only architecture fact reconciliation.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `package.json` as read-only evidence.

## Goal

Reconcile ADR-006 with the current dependency baseline: AI SDK packages are installed in `package.json`, but this does not approve Provider configuration, `.env` work, prompt/provider payload exposure, or real model calls.

## Implementation Steps

1. Record this plan.
2. Update `currentTask` and queue status for `recheck-adr-006-ai-sdk-baseline`.
3. Update ADR-006:
   - add 2026-06-21 review note;
   - move AI SDK packages into the current package baseline;
   - state Provider/env/runtime execution remains gated;
   - leave RAG/Markdown/pgvector as deferred or separately gated.
4. Create evidence and audit-review files.
5. Validate with `git diff --check`, Prettier check, and Module Run v2 pre-commit/pre-push readiness.
6. Commit, fast-forward merge to `master`, push `origin/master`, and clean the merged branch.

## Risk Boundaries

- `package.json` and lockfiles are read-only and must not be changed.
- No dependency install/remove/upgrade.
- No Provider call, provider configuration, `.env` read/change, prompt/provider payload exposure, database/schema/migration work, browser/e2e/dev-server runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate work.
