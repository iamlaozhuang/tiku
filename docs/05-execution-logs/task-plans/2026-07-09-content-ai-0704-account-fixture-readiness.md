# 2026-07-09 Content AI 0704 Account Fixture Readiness Plan

## Task

- Task id: `content-ai-0704-account-fixture-readiness-2026-07-09`
- Branch: `codex/content-ai-0704-account-fixture-readiness`
- Trigger: user approved adding local 0704 accounts/passwords when role credentials are incomplete.
- Goal: make the local 0704 acceptance role matrix usable for content AI and advanced-edition closed-loop acceptance.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-fixture-preflight.md`

## Scope

Allowed:

- Confirm the current local acceptance target is the approved 0704 local DB by a non-secret mechanism.
- Inspect private acceptance material in memory and report only role labels/status categories.
- If the 0704 target is confirmed, add or repair missing local test-owned account credentials for the acceptance role matrix.
- Store new credential values only in the external private acceptance material, never in repo docs, chat, logs, evidence, or audit.
- Verify role login and route-boundary categories through localhost or local service calls without recording sessions, cookies, tokens, auth headers, localStorage, raw DOM, raw rows, internal ids, or complete content.

Blocked:

- Provider execution.
- Env or DB URL output.
- `.env*`, package, lockfile, source, test, schema, migration, seed, staging/prod/deploy, Cost Calibration, destructive DB operations.
- Screenshots and raw DOM.
- Any role-permission change that grants standard roles advanced AI or enterprise-training capability.

## Role Matrix

Target local acceptance selectors:

- `content_admin`
- `super_admin`
- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`

Expected boundaries:

- `personal_standard_student`, `org_standard_employee`, and `org_standard_admin` remain denied, hidden, unavailable, or upgrade-guided for advanced AI generation.
- `personal_advanced_student`, `org_advanced_employee`, and `org_advanced_admin` have discoverable advanced AI surfaces when authorization context is valid.
- `content_admin` can use content backend AI draft/review surfaces without becoming an organization or learner actor.
- `super_admin` is only used to verify scoped backend context where needed; no raw internal ids are recorded.

## Execution Plan

1. Confirm branch/worktree and this task metadata.
2. Run a non-secret private-material probe to determine whether exact selectors already exist.
3. Confirm the local target is the approved 0704 target before any write. If confirmation fails, stop with blocked evidence and do not write accounts.
4. Locate existing product/service account creation boundaries. Prefer supported local product/service paths; use direct non-destructive local DB upsert only if no supported path exists and the target is confirmed.
5. Add only missing test-owned role accounts and required authorization/admin/employee bindings.
6. Update external private acceptance material with credential values in place, without outputting values.
7. Verify each role by login and route-boundary categories only.
8. Write redacted evidence and adversarial audit.
9. Run scoped formatting, `git diff --check`, `lint`, `typecheck`, and Module Run v2 gates.

## Risk Controls

- Target confirmation is a hard precondition for any local DB mutation.
- Account creation is additive or idempotent; no destructive DB operation is allowed.
- Evidence records role labels, route labels, status categories, and aggregate counts only.
- No code behavior changes are expected in this branch.
- Any fresh current-code defect found during acceptance must be handled in a separate short branch after root-cause analysis.
