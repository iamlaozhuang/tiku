# 2026-07-03 Organization Training Source Landing

## Task

- Task ID: `organization-training-source-landing-2026-07-03`
- Branch: `codex/organization-training-source-landing-2026-07-03`
- Goal source: current user approved serial goal-mode source landing packages.
- Scope: land the accepted organization training UI/UX source contract inside existing schema/runtime boundaries.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/05-execution-logs/evidence/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-organization-training-ui-ux-contract.md`

## Implementation Boundary

Allowed:

- Admin organization training UI wording and flow scaffolding.
- Student organization training UI wording and answer interaction copy.
- Content workspace route ownership correction.
- Validator/service rejection for first-release `mock_exam` source context.
- Focused unit tests and task evidence/audit docs.

Blocked:

- Schema or migration work.
- Dependency or lockfile changes.
- Provider calls, Prompt execution, AI payload reads, or model configuration changes.
- Direct database connection, raw row reads, or data mutation outside mocked tests.
- Browser/runtime/e2e traces.
- Full question, paper, material, resource, answer, prompt, Provider payload, credential, cookie, token, env, PII, or plaintext redeem_code evidence.
- Release readiness, final Pass, production usable, staging/prod deploy, PR, force push, or cost calibration claims.

## Approach

1. Keep historical `OrganizationTrainingSourceContextType` compatibility intact, but deny `mock_exam` at route validator and service command normalization for first-release organization training source use.
2. Replace the admin page's visible contract from old `组织培训` three-column technical forms to `企业训练` list-first workspace with a visible four-step creation guide and non-technical source choices.
3. Remove content-admin organization-training route exposure by redirecting content workspace access to the organization-owned route.
4. Improve employee page wording and controls to present `企业训练`, assignment metadata, progress/save/submit/review actions, and no formal `mock_exam` wording.
5. Update focused UI, validator, and service tests so they prove the new contract rather than the old metadata-only technical surface.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts src/server/validators/organization-training.test.ts src/server/services/organization-training-service.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push readiness checks for this task.

## Review Plan

- First pass: verify requirement-to-source mapping, role/edition boundaries, no content route leak, and no schema/dependency drift.
- Second pass: adversarially check tests, evidence redaction, old wording, `mock_exam` leakage, raw IDs/content, and recovery metadata.
