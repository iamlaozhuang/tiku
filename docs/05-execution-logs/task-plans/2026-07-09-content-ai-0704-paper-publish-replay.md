# 2026-07-09 Content AI 0704 Paper Publish Replay Plan

## Task

- Task id: `content-ai-0704-paper-publish-replay-2026-07-09`
- Branch: `codex/content-ai-0704-paper-publish-replay`
- Goal contribution: replay the current local 0704 content-admin AI组卷 formal paper draft from draft to published paper, then verify the published paper is visible through a user-authorized paper surface.
- Scope type: local 0704 localhost acceptance replay; no source implementation unless a fresh current-code defect is reproduced and a separate short repair branch is opened.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-fixture-history-refresh.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-question-publish-replay.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-paper-formal-publish-loop.md`
- `docs/05-execution-logs/audits-reviews/2026-07-09-content-ai-paper-formal-publish-loop-audit.md`
- `src/app/api/v1/papers/**`
- `src/app/api/v1/student-papers/**`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/paper-composition-lifecycle-runtime.ts`
- `src/server/services/student-paper-service.ts`
- `src/server/services/student-flow-runtime.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `src/server/repositories/student-flow-runtime-repository.ts`
- private acceptance account files under `D:/tiku-local-private/acceptance/**`, in memory only.

## Boundaries

- Localhost only: `127.0.0.1:3000` / `localhost`.
- Use the existing process-only 0704 DB override; do not output DB URL or credentials.
- Use private account credentials only in memory.
- No Provider execution.
- No screenshot, raw DOM, session/cookie/token/localStorage/Auth header capture.
- No raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, full material, resource, or chunk content in evidence.
- No dependency, package, lockfile, schema, migration, seed, staging, production, deploy, force push, PR, or Cost Calibration action.
- Product route write allowed for publishing the existing 0704 content AI formal paper draft through `POST /api/v1/papers/{publicId}/publish`.
- If existing private learner/employee accounts have no matching authorization scope for the published paper, use the user's prior local-0704 approval to create one local personal account and matching personal activation through product APIs only; keep the generated credential in memory or the repository-external private acceptance directory, never in evidence, chat, git, logs, or committed files.
- If publish fails due a current-code defect, stop runtime mutation work, record redacted symptom evidence, and open a separate repair branch after root-cause confirmation.

## Execution Steps

1. Confirm branch, master/origin alignment baseline, and working tree status.
2. Confirm localhost service is reachable and uses the approved 0704 process-only DB target without printing DB details.
3. Login with the content admin account in memory and locate the AI组卷 history item whose formal paper draft is target-ready.
4. Read the paper detail through the product route and verify only aggregate publish preconditions: draft status, paper_section count, paper question count, scored question count, and total-score alignment.
5. Publish through `POST /api/v1/papers/{publicId}/publish`.
6. Verify published status through content paper detail/list and verify a matching authorized user can see the paper through `GET /api/v1/student-papers`.
7. If no existing account has matching scope, create a local product-route account/redeem-code fixture and re-run student visibility.
8. Record only redacted aggregate evidence and adversarial review.
9. Run targeted tests, lint, typecheck, `git diff --check`, scoped Prettier check, Module Run v2 precommit, and prepush readiness.
10. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, delete short branch, and confirm clean/aligned.

## Expected Validation

- Redacted localhost paper publish replay: pass.
- Content AI / formal paper targeted tests: existing related tests pass.
- Adjacent personal learner AI tests: pass.
- Adjacent organization admin/employee tests: pass.
- `corepack pnpm@10.26.1 lint`: pass.
- `corepack pnpm@10.26.1 typecheck`: pass.
- `git diff --check`: pass.
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`: pass.
- Module Run v2 precommit hardening: pass.
- Module Run v2 prepush readiness: pass.

## Adversarial Review Focus

- Content AI组卷 remains plan-and-select plus formal platform question references, not Provider-generated full question bodies.
- Publishing uses existing governed paper publish validation and locks source formal questions/materials.
- Student visibility requires published paper plus effective authorization scope; no UI-only claim.
- Personal advanced learner, organization advanced employee, and organization advanced admin AI generation code paths are not modified.
- Evidence remains redacted and does not include sensitive or raw content.
