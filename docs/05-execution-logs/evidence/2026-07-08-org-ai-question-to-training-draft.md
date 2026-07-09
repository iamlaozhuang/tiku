# 2026-07-08 Org AI Question To Training Draft Evidence

## Scope

- Branch: `codex/org-ai-question-to-training-draft`
- Stage: AI出题结果物化为企业训练题目草稿
- Scope kept to organization AI question result safe snapshot, enterprise training admin read model, draft detail route, and admin publish-form prefill.
- No DB/schema/migration/seed/fixture changes.
- No package/lockfile changes.
- No Provider execution.
- No formal question, formal paper, mock_exam, exam_report, or mistake_book writes.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- AI generation traceability and advanced edition requirements listed in the task plan.
- Related code under admin AI generation persistence/local contract route and organization training route/service/UI.

## RED

Command:

```bash
corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot
```

Expected failing tests before implementation:

- AI result persistence did not expose organization training question draft snapshot.
- Local contract route did not persist enterprise training question draft snapshot.
- Organization training detail read model returned draft unavailable for AI question drafts.
- Detail route did not resolve task-linked draft question details.
- Admin UI did not prefill publish form from AI question draft detail.

## GREEN Verification

Targeted tests:

```bash
corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot
```

Initial result: 5 test files passed, 142 tests passed.

Plan-listed targeted tests including adjacent admin AI generation UI:

```bash
corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot
```

Result: 6 test files passed, 181 tests passed.

Post-format rerun result: 6 test files passed, 181 tests passed.

Typecheck:

```bash
corepack pnpm@10.26.1 exec tsc --noEmit
```

Result: passed.

Post-format result: passed.

Targeted lint:

```bash
corepack pnpm@10.26.1 exec eslint src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx src/server/contracts/admin-ai-generation-result-persistence-contract.ts src/server/contracts/organization-training-contract.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/organization-training-route.test.ts src/server/services/organization-training-route.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-service.ts tests/unit/organization-training-admin-entry-surface.test.ts
```

Result: passed.

Post-format result: passed.

Full lint:

```bash
corepack pnpm@10.26.1 exec eslint .
```

Result: passed.

Post-format result: passed.

Formatting:

```bash
corepack pnpm@10.26.1 exec prettier --check docs/05-execution-logs/task-plans/2026-07-08-org-ai-question-to-training-draft.md docs/05-execution-logs/evidence/2026-07-08-org-ai-question-to-training-draft.md docs/05-execution-logs/audits-reviews/2026-07-08-org-ai-question-to-training-draft-audit.md src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx src/server/contracts/admin-ai-generation-result-persistence-contract.ts src/server/contracts/organization-training-contract.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/organization-training-route.test.ts src/server/services/organization-training-route.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-service.ts tests/unit/organization-training-admin-entry-surface.test.ts
```

Result: passed.

Project script lint:

```bash
corepack pnpm@10.26.1 run lint
```

Result: passed.

Whitespace check:

```bash
git diff --check
```

Result: passed.

Module Run v2 pre-commit hardening:

```bash
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-ai-question-to-training-draft-2026-07-08
```

Initial result: blocked because the previous current task id was still active in project state and this temporary stage branch had not yet been materialized in `task-queue.yaml`.

After materializing `org-ai-question-to-training-draft-2026-07-08` with scoped allowed files and requirement mapping:

Result: passed.

## Adversarial Review

- Role boundary: organization AI question snapshot is only resolved for `workspace = organization`, `ownerType = organization`, and source metadata `organization_ai_result/question`.
- Draft safety: draft without structured safe snapshot still returns `detailAvailability = unavailable`, no fabricated content.
- Data boundary: implementation reads/writes only redacted/safe snapshot fields; it does not expose raw Provider payload, raw prompt, raw output, raw DB rows, or numeric internal ids.
- Product boundary: no formal content adoption path changed; no formal question/paper/mock exam write added.
- Authorization boundary: existing organization training admin context and visible organization scope checks remain in the detail route/read model.
- Evidence boundary: this file contains only synthetic summaries and command outcomes; no credentials, sessions, cookies, tokens, env values, DB URL, raw rows, Provider payload, raw prompt, raw AI output, or full customer material.
