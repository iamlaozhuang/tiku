# Phase 3 Paper Publish Snapshot Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Phase 3 baseline for publishing a draft paper with strong validation, source content locking hooks, immutable published snapshots, and a standard `/api/v1/papers/{publicId}/publish` route.

**Architecture:** Keep the existing Phase 3 baseline shape: thin Next.js route handlers call service methods, service owns publish rules, repository interface owns persistence hooks, and DTOs expose only public identifiers. This task does not add a database implementation, schema change, migration, dependency, or production runtime wiring.

**Tech Stack:** Next.js App Router route handlers, TypeScript service/repository contracts, Vitest unit tests, existing API response helpers.

---

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-paper-draft-composition-baseline.md`

## Queue Scope

- Task id: `phase-3-paper-publish-snapshot-baseline`
- Branch: `codex/phase-3-paper-publish-snapshot-baseline`
- Allowed code surface:
  - `src/app/api/v1/papers/**`
  - `src/server/services/**`
  - `src/server/repositories/**`
  - `src/server/contracts/**`
  - `src/server/mappers/**`
  - `src/server/validators/**`
  - `tests/unit/**`
  - task plan, evidence, security review, project state, task queue
- Blocked files:
  - `package.json`
  - `pnpm-lock.yaml`
  - `package-lock.json`
  - `src/db/schema/**`
  - `drizzle/**`
  - `.env.example`

## File Plan

- Modify `src/server/contracts/paper-draft-contract.ts`
  - Add publish validation issue DTOs and publish result DTO.
- Modify `src/server/repositories/paper-draft-repository.ts`
  - Add repository hooks to publish a validated draft and lock referenced source `question` / `material` rows by public ids.
- Modify `src/server/services/paper-draft-service.ts`
  - Add `publishPaper(publicId)` behavior, validation rules, publish response mapping, and unavailable runtime method.
- Modify `src/server/services/paper-draft-route.ts`
  - Add `publish.POST` handler using `publicId`.
- Add `src/app/api/v1/papers/[publicId]/publish/route.ts`
  - Export `POST` through the unavailable baseline service.
- Modify `src/server/services/paper-draft-service.test.ts`
  - Add RED tests for publish success, validation failure, non-draft conflict, missing paper, source lock public ids, and immutable snapshot behavior.
- Modify `src/server/services/paper-draft-route.test.ts`
  - Add route-level RED test for `POST /api/v1/papers/{publicId}/publish`.
- Add `docs/05-execution-logs/audits-reviews/2026-05-19-phase-3-paper-publish-snapshot-baseline-security-review.md`
  - Review authorization, API contract, data contract, admin route risk, and accepted gaps.
- Add `docs/05-execution-logs/evidence/2026-05-19-phase-3-paper-publish-snapshot-baseline.md`
  - Record RED/GREEN commands, validation output, commit, merge, push, and cleanup.
- Modify `docs/04-agent-system/state/project-state.yaml`
  - Advance next recommended action to `claim_phase_3_paper_lifecycle_asset_baseline`.
- Modify `docs/04-agent-system/state/task-queue.yaml`
  - Mark `phase-3-paper-publish-snapshot-baseline` as `done` after validation.

## TDD Steps

- [ ] **Step 1: Write failing publish service and route tests**
  - Cover successful publish from draft to published with `publishedAt`.
  - Cover validation failures:
    - paper has no counting question
    - `paper.totalScore` is missing or does not equal paper question score sum
    - paper question score is missing
    - subjective scoring point total does not equal question score
    - empty `paper_section` exists
    - source question or source material cannot be locked
  - Cover lifecycle failures:
    - missing paper returns `404203`
    - non-draft paper returns `409204`
  - Cover repository calls:
    - `publishPaper` receives the paper public id
    - source question public ids are locked
    - material public ids from material snapshots are locked
  - Run: `npm.cmd run test:unit -- src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts`
  - Expected RED: fail because `publishPaper` and `publish` route handler do not exist.

- [ ] **Step 2: Implement minimal publish contracts and repository hooks**
  - Add `PaperPublishValidationIssueDto` and `PaperPublishResultDto`.
  - Add `publishPaper(input)` to `PaperDraftRepository`.
  - Keep all numeric ids internal; publish input uses public ids.

- [ ] **Step 3: Implement publish service validation**
  - Only draft paper can publish.
  - At least one scored paper question is required.
  - Every paper question must have `score`.
  - `paper.total_score` must equal scored question total.
  - Subjective question types `short_answer` and AI-scored `fill_blank` require scoring points whose total equals the question score.
  - No `paper_section` may be empty.
  - Source `question` and `material` public ids must be resolved through repository publish hooks.
  - Validation failure returns `{ code: 422204, message: "Paper publish validation failed.", data: null }` per the approved question-paper contract.

- [ ] **Step 4: Implement publish route**
  - Add `POST /api/v1/papers/{publicId}/publish`.
  - Use `[publicId]`, not `[id]`.
  - Return standard `{ code, message, data }` envelope.
  - Keep runtime wiring unavailable with `503203` until admin auth integration lands.

- [ ] **Step 5: Run targeted GREEN tests**
  - Run: `npm.cmd run test:unit -- src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts`
  - Expected: pass.

- [ ] **Step 6: Write security review and evidence**
  - Security review verdict must be `APPROVE` or non-blocking `COMMENT`.
  - Evidence must include RED/GREEN output and guardrails.

- [ ] **Step 7: Run queued validation commands**
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run test:unit`
  - `Select-String -Path 'src\server\services\*.ts' -Pattern 'publish|snapshot|scoring_point|standard_answer'`
  - `Select-String -Path 'src\app\api\v1\papers\**\*.ts' -Pattern 'publish|code|message|data'`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Also run `npm.cmd run format:check` and readiness checks before closeout.

## Risk Defense

- Authorization/admin: this baseline adds route shape and service behavior only; live route remains unavailable until authenticated admin runtime wiring exists.
- API contract: all responses keep `{ code, message, data, pagination? }`, camelCase JSON, and public identifiers only.
- Data contract: source locks are represented by repository hooks using source public ids and material public ids; numeric ids remain internal.
- Snapshot immutability: publish service treats existing paper question snapshots as the published content source and does not mutate snapshot DTOs.
- Dependency and migration: no package, lockfile, schema, migration, or environment changes are allowed.
