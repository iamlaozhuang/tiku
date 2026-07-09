# 2026-07-09 Content AI Paper Formal Publish Loop Evidence

## Task

- Task id: `content-ai-paper-formal-publish-loop-2026-07-09`
- Branch: `codex/content-ai-paper-formal-publish-loop`
- Base: `origin/master` at `ab9882913`
- Evidence mode: redacted command, status, file, and count level only.

## Requirement Mapping Result

- Content-admin AI paper generation must use selected platform formal question references.
- AI paper generation output is plan-only; local paper assembly decides the selected formal questions.
- Formal adoption creates a formal paper draft and composes it through `paper_section` and `paper_question` draft APIs.
- Paper publish remains under existing paper draft detail and publish validation.
- The branch must not change personal advanced, organization advanced employee, or organization advanced admin AI generation semantics.

## Code Change Evidence

- `src/server/services/admin-ai-generation-formal-draft-adapter.ts`
  - Paper question payload validation now requires an existing formal `questionPublicId`.
  - Paper composition rejects companion question drafts before any paper or question writer is called.
  - Paper composition still attaches selected formal questions through `addQuestionToDraftPaper`.
- `src/server/contracts/admin-ai-generation-formal-draft-adapter-contract.ts`
  - Formal paper question draft payload now expresses `questionPublicId` as required and `companionQuestionDraft` as `null`.
- `src/lib/admin-ai-generation-formal-draft-payload.test.ts`
  - Added field-level coverage for content paper assembly mapping to formal paper draft payload.
  - Added field-level coverage rejecting non-platform question sources for content paper payloads.

## TDD Evidence

- Red command:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts --reporter=dot`
- Red result:
  - Failed as expected before implementation: adapter still accepted companion question draft path for paper adoption.

## Validation Commands

- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts --reporter=dot`
  - Result: pass, 1 file, 8 tests.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts --reporter=dot`
  - Result: pass, 2 files, 12 tests.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-paper-ui.test.ts src/server/services/paper-draft-service.test.ts --reporter=dot`
  - Result: pass, 5 files, 78 tests.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 5 files, 151 tests.
- `corepack pnpm@10.26.1 run typecheck`
  - Result: pass.
- `corepack pnpm@10.26.1 run lint`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-paper-formal-publish-loop-2026-07-09`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-paper-formal-publish-loop-2026-07-09 -SkipRemoteAheadCheck`
  - Result: pass.

## Safety Evidence

- Provider execution: not executed.
- Browser runtime and screenshots: not executed.
- DB connection or mutation: not executed.
- Env, secret, token, cookie, session, localStorage, auth header values: not read or recorded.
- Package and lockfile changes: none.
- Schema, migration, seed, staging, production, deploy, and Cost Calibration actions: not executed.
- Evidence redaction: no raw Provider payload, raw prompt, raw AI output, raw DB row, internal numeric id, complete question text, complete paper text, material text, or chunk content recorded.

## Master Post-Merge Validation

- Fast-forward merge:
  - Source branch: `codex/content-ai-paper-formal-publish-loop`
  - Target branch: `master`
  - Code commit: `42f467b37`
  - Result: pass.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-paper-ui.test.ts src/server/services/paper-draft-service.test.ts --reporter=dot`
  - Result: pass, 5 files, 78 tests.
- `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
  - Result: pass, 5 files, 151 tests.
- `corepack pnpm@10.26.1 run typecheck`
  - Result: pass.
- `corepack pnpm@10.26.1 run lint`
  - Result: pass.
- `git diff --check`
  - Result: pass.

## Closeout

- Push target: `origin/master`
- Push result: pass, `ab9882913..5fb40e209`
- Short branch cleanup: local branch `codex/content-ai-paper-formal-publish-loop` deleted.
- Final pushed master: `5fb40e209`
