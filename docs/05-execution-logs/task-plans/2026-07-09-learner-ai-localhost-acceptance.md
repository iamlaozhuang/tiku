# 2026-07-09 Learner AI Localhost Acceptance Plan

## Task

- Task id: `learner-ai-localhost-acceptance-2026-07-09`
- Branch: `codex/learner-ai-localhost-acceptance`
- Scope type: validation-only localhost acceptance; no repair is assumed.
- Closure rule: only if validation reproduces a current real blocker, stop this task after redacted evidence and open a separate short repair branch.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest 2026-07-09 learner AI regression evidence and audit.

## Boundaries

- Localhost / `127.0.0.1` only.
- No Provider execution, external service, staging/prod/deploy, PR, force push, Cost Calibration, package, lockfile, schema, migration, seed, or dependency change.
- No direct DB connection, destructive DB operation, raw DB row output, DB URL, env value, credential, session, cookie, token, localStorage, Authorization header, Provider payload, raw prompt, raw AI output, full question, full paper, or material content in evidence.
- No screenshots, traces, or raw DOM capture.
- No production source or test changes in this validation branch.

## Validation Plan

1. Re-run focused learner AI regression tests that cover personal advanced learner and organization advanced employee AI出题 / AI组卷 boundaries.
2. Run status-only localhost checks for safe route availability without recording bodies or browser storage.
3. Run `typecheck`, `lint`, scoped prettier, and `git diff --check`.
4. Run Module Run v2 pre-commit and pre-push readiness.
5. Write redacted evidence and adversarial audit.

## Adversarial Review Focus

- Personal advanced learner AI出题 and AI组卷 remain isolated learner self-practice, not formal `practice`, `answer_record`, `mistake_book`, formal `question`, or formal `paper` writes.
- Organization advanced employee AI results remain employee-scoped; organization admins do not gain raw learner AI visibility.
- Organization advanced employee AI组卷 may use allowed platform and same-organization enterprise sources without leaking another employee's learner AI output.
- Standard personal learners and standard organization employees remain denied, hidden, upgrade-guided, or unavailable for advanced AI generation.
- Content admin and organization admin AI generation/training surfaces are not changed by this validation task.
