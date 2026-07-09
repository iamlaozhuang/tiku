# 企业 AI 组卷结果物化为企业训练试卷草稿

## Task

- Task id: `org-ai-paper-to-training-draft-2026-07-08`
- Branch: `codex/org-ai-paper-to-training-draft`
- Goal stage: 4 / 5
- Scope: organization advanced admin AI组卷 result materialization into organization training paper draft detail and publish prefill.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-generation-parameter-contract.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-generation-rag-scope.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-question-to-training-draft.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-paper-admin-route-container-contract.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-paper-admin-route-repository-wiring.md`

## Requirement Mapping Result

- Organization AI组卷 is `org_advanced_admin` only; `org_standard_admin` remains denied or unavailable.
- AI组卷 means AI creates a paper assembly plan, then local services select existing formal/enterprise snapshot questions.
- Organization AI组卷 output must enter organization training draft domain, not formal `paper`, `mock_exam`, `question`, `exam_report`, or `mistake_book`.
- The paper draft detail must expose admin-safe question/section detail for review, with answer and analysis collapsed by default.
- Missing source details must not be fabricated. If a draft lacks a complete safe paper snapshot, the detail remains unavailable and publish prefill is blocked.
- Evidence and committed docs must remain redacted: no credentials, sessions, cookies, tokens, env values, DB URL, raw DB rows, internal numeric ids, Provider payload, raw prompt, raw AI output, or full customer material.

## Implementation Boundary

- Do not change DB/schema/migration/seed/fixture.
- Do not execute Provider-enabled flow or read env/secret.
- Do not change `package.json` or lockfile.
- Do not add dependencies.
- Do not create formal platform paper or mock exam records.
- Do not alter content admin, personal learner, or employee AI training flows except through shared type compatibility if unavoidable.
- Reuse existing organization training publish endpoint and question snapshot semantics.

## Design

1. Extend admin AI result persistence contract with an organization training paper draft payload:
   - `paperAssemblyContainer` summary with sections and selected questions.
   - resolved `paperSections` for admin-safe display, each containing selected question details.
   - source composition and match quality.
2. Persist the payload only when:
   - workspace is `organization`;
   - generation kind is `paper`;
   - paper assembly status is `assembled`;
   - selected question count is positive.
3. Resolve selected question bodies from safe existing sources:
   - platform formal questions from repository rows;
   - enterprise training snapshots from same-organization published training versions already available to admin assembly.
4. Extend organization training admin detail read model:
   - return `contentKind = paper_training`;
   - include optional `paperSections`;
   - keep `questions` flattened for existing publish flow.
5. Extend route draft detail resolver to return AI paper draft detail only when source metadata proves `organization_ai_result / paper`.
6. Extend UI detail and continue-configuration flow:
   - show paper section structure;
   - show real question cards;
   - answer/analysis collapsed by default;
   - prefill publish form from flattened safe questions.

## TDD Plan

RED first:

1. `admin-ai-generation-local-contract-route.test.ts`
   - assembled org AI paper persists `organizationTrainingPaperDraft`.
   - insufficient paper assembly does not persist a publishable paper draft snapshot.
2. `admin-ai-generation-result-persistence-repository.test.ts`
   - DTO exposes organization training paper draft from redacted snapshot.
   - invalid or non-organization paper snapshot remains null.
3. `organization-training-service.test.ts`
   - admin detail read model returns paper sections and flattened questions for AI paper drafts.
   - unavailable state remains for missing snapshot.
4. `organization-training-route.test.ts`
   - route resolves task-linked paper draft detail only for same organization and paper generation metadata.
5. `organization-training-admin-entry-surface.test.ts`
   - clicking `继续配置` on AI组卷 draft shows paper section detail and prefilled publish form.

GREEN minimal implementation follows only after red failures are verified.

## Verification

Targeted:

```text
corepack pnpm@10.26.1 exec vitest run src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot
```

Broader related:

```text
corepack pnpm@10.26.1 exec vitest run src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts --reporter=dot
```

Gates:

```text
corepack pnpm@10.26.1 run typecheck
corepack pnpm@10.26.1 run lint
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-ai-paper-to-training-draft-2026-07-08
```

## Adversarial Review Checklist

- Organization-only: source task owner and draft organization must match.
- Standard organization admin remains denied/unavailable for enterprise training and AI generation.
- No raw Provider/prompt/output or internal numeric id in DTO, UI, evidence, or logs.
- No formal content write path changed.
- Missing question source or insufficient assembly cannot become a publishable draft.
- Weak/none evidence publish gates still use existing organization training publish validation.
- Published enterprise training remains immutable; changes require copy to new draft.
