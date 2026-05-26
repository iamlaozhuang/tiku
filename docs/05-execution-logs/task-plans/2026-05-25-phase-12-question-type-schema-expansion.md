# Phase 12 Question Type Schema Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand MVP question type support to include `case_analysis` and `calculation` while keeping requirements, glossary, database enum, API contracts, admin authoring, student runtime, and tests aligned.

**Architecture:** `question_type` remains the canonical database enum and is surfaced through `src/db/schema/paper.ts`, `src/server/models/paper.ts`, validators, contracts, mappers, and UI label maps. Route handlers and Server Actions stay thin; question behavior is implemented in services, validators, repositories, and client components that already own each workflow. Database changes must be generated/reviewed as migrations, not pushed directly.

**Tech Stack:** Next.js App Router, TypeScript, Drizzle ORM, PostgreSQL enum migrations, Vitest, Playwright, Tailwind/shadcn-style local components.

---

## Approval And Boundary

- TaskId: `phase-12-plan-question-type-schema-expansion`
- Branch: `codex/phase-12-question-type-schema-expansion`
- Human approval: user approved this planning gate on 2026-05-26 and explicitly required `case_analysis` and `calculation` to be included in MVP.
- Current planning task may update requirements/glossary/task plan/evidence/state/queue only.
- Current planning task must not modify `src/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`, `package.json`, lockfiles, `.env.example`, or `.env.local`.
- The implementation tasks below still require a separate explicit approval before schema, migration, script, package, or runtime code changes.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-25-phase-12-mvp-requirements-runtime-audit.md`

## Findings

- `docs/01-requirements/modules/02-question-paper.md` already lists 案例分析题 and 计算题 as 首期题型.
- `docs/03-standards/glossary.yaml` previously registered `case_analysis` and `calculation` only as commented 二期规划 values.
- `src/db/schema/paper.ts` currently defines `questionTypeValues` as `single_choice`, `multi_choice`, `true_false`, `fill_blank`, and `short_answer`.
- Student practice/mock UI currently treats `short_answer` as subjective text answer; `case_analysis` and `calculation` should follow the same text-answer path unless a later approved requirement introduces a separate numeric/formula engine.
- `mistake_book` is objective-first in SSOT and currently filters objective question types. `case_analysis` and `calculation` should appear in reports and score statistics, but should not be forced into objective mistake_book flows unless they are auto-scored objective variants in a later approved task.

## Planning-Task Changes

- Modify: `docs/03-standards/glossary.yaml`
  - Activate `case_analysis` and `calculation` in `enums.question_type`.
- Modify: `docs/01-requirements/modules/02-question-paper.md`
  - Add the canonical enum identifiers beside each 首期题型.
- Modify: `docs/04-agent-system/state/task-queue.yaml`
  - Record approval evidence, expanded planning doc boundary, and closed status after validation.
- Modify: `docs/04-agent-system/state/project-state.yaml`
  - Record this planning task as the current closed task after validation.
- Create: `docs/05-execution-logs/evidence/2026-05-25-phase-12-question-type-schema-expansion.md`
  - Record redacted evidence, validation commands, and next approval gate.

## Future Implementation File Map

- Modify: `docs/02-architecture/interfaces/question-paper-contract.md`
  - Add `case_analysis` and `calculation` to `question_type` contract values.
- Modify: `src/db/schema/paper.ts`
  - Add `"case_analysis"` and `"calculation"` to `questionTypeValues`.
- Create: `drizzle/{YYYYMMDDHHMMSS}_add_question_type_case_analysis_calculation.sql`
  - Add the two enum values to PostgreSQL `question_type`.
- Modify: `drizzle/meta/_journal.json` and latest `drizzle/meta/*_snapshot.json`
  - Let `drizzle-kit generate` update metadata; review that it only represents the enum expansion.
- Modify: `src/server/validators/question.ts`
  - Accept both values through `questionTypeValues` and enforce no option rows for subjective-only types.
- Create or modify: `src/server/validators/question.test.ts`
  - Cover create/update validation for both new types.
- Modify: `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
  - Add labels and form behavior for both values.
- Modify: `src/features/student/practice/StudentPracticePage.tsx`
  - Normalize both values and render text-answer controls.
- Modify: `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
  - Normalize both values and include them in report display/statistics.
- Modify: `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
  - Add safe labels for snapshots; do not add them to objective-only filter options unless backend supports them.
- Modify: `src/server/services/practice-service.ts`
  - Treat `case_analysis` and `calculation` as subjective answer types for answer validation and scoring queue behavior.
- Modify: `src/server/services/mock-exam-service.ts`
  - Mirror practice behavior for mock exam submit/scoring.
- Modify: `src/server/services/paper-draft-service.ts`
  - Ensure snapshots preserve the new values and score totals include them.
- Modify targeted tests:
  - `tests/unit/admin-question-material-ui.test.ts`
  - `tests/unit/student-practice-ui.test.ts`
  - `tests/unit/student-mock-exam-report-ui.test.ts`
  - `tests/unit/student-mistake-book-ui.test.ts`
  - `src/server/services/question-service.test.ts`
  - `src/server/services/practice-service.test.ts`
  - `src/server/services/mock-exam-service.test.ts`
  - `src/server/services/paper-draft-service.test.ts`
  - `e2e/content-action-closures.spec.ts`

## Task 1: Requirements And Glossary SSOT

**Files:**

- Modify: `docs/03-standards/glossary.yaml`
- Modify: `docs/01-requirements/modules/02-question-paper.md`
- Modify: `docs/02-architecture/interfaces/question-paper-contract.md`

- [ ] **Step 1: Verify requirement source**

Run:

```powershell
rg -n "案例分析题|计算题|case_analysis|calculation" docs\01-requirements docs\03-standards\glossary.yaml docs\02-architecture\interfaces\question-paper-contract.md
```

Expected:

```text
docs\01-requirements\modules\02-question-paper.md includes both Chinese names and enum identifiers.
docs\03-standards\glossary.yaml includes active case_analysis and calculation enum values.
docs\02-architecture\interfaces\question-paper-contract.md includes both enum values after implementation.
```

- [ ] **Step 2: Update interface contract**

Replace the `question_type` value list in `docs/02-architecture/interfaces/question-paper-contract.md` with:

```markdown
| `question_type` | `question_type` | `single_choice`, `multi_choice`, `true_false`, `fill_blank`, `short_answer`, `case_analysis`, `calculation` |
```

- [ ] **Step 3: Run doc validation**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
git diff --check
```

Expected: both commands pass.

## Task 2: Database Enum And Migration

**Files:**

- Modify: `src/db/schema/paper.ts`
- Create: `drizzle/{YYYYMMDDHHMMSS}_add_question_type_case_analysis_calculation.sql`
- Modify: `drizzle/meta/_journal.json`
- Modify: latest `drizzle/meta/*_snapshot.json`

- [ ] **Step 1: Write a schema test expectation**

If no focused schema test exists for paper enums, create `src/db/schema/paper.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { questionTypeValues } from "./paper";

describe("paper schema question_type enum", () => {
  it("registers all MVP question types", () => {
    expect(questionTypeValues).toEqual([
      "single_choice",
      "multi_choice",
      "true_false",
      "fill_blank",
      "short_answer",
      "case_analysis",
      "calculation",
    ]);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```powershell
npm.cmd run test:unit -- src/db/schema/paper.test.ts
```

Expected: FAIL because `case_analysis` and `calculation` are absent from `questionTypeValues`.

- [ ] **Step 3: Update schema enum values**

In `src/db/schema/paper.ts`, update `questionTypeValues` to:

```typescript
export const questionTypeValues = [
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
] as const;
```

- [ ] **Step 4: Generate migration**

Run the existing Drizzle generation workflow used by this repo. If manual review is needed, the SQL must add values without recreating or dropping the enum:

```sql
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'case_analysis';
--> statement-breakpoint
ALTER TYPE "public"."question_type" ADD VALUE IF NOT EXISTS 'calculation';
--> statement-breakpoint
```

Expected:

```text
One migration file is created under drizzle/.
No table drop, column drop, enum recreation, or data rewrite appears in the migration.
```

- [ ] **Step 5: Run focused schema test and migration diff checks**

Run:

```powershell
npm.cmd run test:unit -- src/db/schema/paper.test.ts
rg -n "DROP|DELETE|TRUNCATE|ALTER TYPE.*ADD VALUE|case_analysis|calculation" drizzle
git diff --check
```

Expected: test passes; diff contains only safe `ALTER TYPE ... ADD VALUE` statements for this enum expansion.

## Task 3: Question Validation And Services

**Files:**

- Modify: `src/server/validators/question.ts`
- Create or modify: `src/server/validators/question.test.ts`
- Modify: `src/server/services/question-service.test.ts`

- [ ] **Step 1: Add validation tests**

Add tests that call `normalizeCreateQuestionInput` with `case_analysis` and `calculation`:

```typescript
import { describe, expect, it } from "vitest";

import { normalizeCreateQuestionInput } from "./question";

const baseInput = {
  profession: "marketing",
  level: 3,
  subject: "skill",
  stemRichText: "<p>题干</p>",
  analysisRichText: "<p>解析</p>",
  standardAnswerRichText: "<p>参考答案</p>",
  multiChoiceRule: "all_correct_only",
  scoringMethod: "ai_scoring",
  materialPublicId: "material_public_123",
  questionOptions: [],
  scoringPoints: [{ description: "步骤完整", score: "5.0", sortOrder: 1 }],
};

describe("normalizeCreateQuestionInput question types", () => {
  it("accepts case_analysis as a subjective MVP question type", () => {
    const result = normalizeCreateQuestionInput({
      ...baseInput,
      questionType: "case_analysis",
    });

    expect(result.success).toBe(true);
  });

  it("accepts calculation as a subjective MVP question type", () => {
    const result = normalizeCreateQuestionInput({
      ...baseInput,
      questionType: "calculation",
    });

    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Run and confirm RED**

Run:

```powershell
npm.cmd run test:unit -- src/server/validators/question.test.ts
```

Expected: FAIL before `questionTypeValues` is expanded, PASS after Task 2.

- [ ] **Step 3: Add service coverage**

In `src/server/services/question-service.test.ts`, add create/list cases for each new type using existing repository mocks and assert API JSON returns `questionType: "case_analysis"` and `questionType: "calculation"`.

- [ ] **Step 4: Run focused service tests**

Run:

```powershell
npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts
```

Expected: PASS.

## Task 4: Admin Authoring UI

**Files:**

- Modify: `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- Modify: `tests/unit/admin-question-material-ui.test.ts`

- [ ] **Step 1: Add RED UI tests**

Add tests that select `case_analysis` and `calculation`, enter scoring points, submit, and assert the payload contains the selected `questionType` with an empty `questionOptions` array.

Expected payload fragment for case analysis:

```typescript
expect(fetchMock).toHaveBeenCalledWith(
  "/api/v1/questions",
  expect.objectContaining({
    body: expect.stringContaining('"questionType":"case_analysis"'),
  }),
);
```

Expected payload fragment for calculation:

```typescript
expect(fetchMock).toHaveBeenCalledWith(
  "/api/v1/questions",
  expect.objectContaining({
    body: expect.stringContaining('"questionType":"calculation"'),
  }),
);
```

- [ ] **Step 2: Run and confirm RED**

Run:

```powershell
npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts
```

Expected: FAIL because the select options and labels do not include the two new types.

- [ ] **Step 3: Update UI labels and type behavior**

Add to `questionTypeLabels`:

```typescript
case_analysis: "案例分析题",
calculation: "计算题",
```

Keep both out of `optionQuestionTypes` so they use the scoring point path instead of option rows.

- [ ] **Step 4: Run focused UI test**

Run:

```powershell
npm.cmd run test:unit -- tests/unit/admin-question-material-ui.test.ts
```

Expected: PASS.

## Task 5: Student Practice, Mock, Report, And Mistake Book Display

**Files:**

- Modify: `src/features/student/practice/StudentPracticePage.tsx`
- Modify: `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- Modify: `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- Modify: `tests/unit/student-practice-ui.test.ts`
- Modify: `tests/unit/student-mock-exam-report-ui.test.ts`
- Modify: `tests/unit/student-mistake-book-ui.test.ts`

- [ ] **Step 1: Add RED UI tests**

Add a practice test with `questionType: "case_analysis"` and one with `questionType: "calculation"`. Both must render a text answer control and submit `textAnswer`.

Add a mock report test that displays both labels in question statistics.

Add a mistake_book display test that renders the labels from a snapshot without adding them to objective-only filter options.

- [ ] **Step 2: Run focused UI tests**

Run:

```powershell
npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts
```

Expected: FAIL before UI normalization maps include the new values.

- [ ] **Step 3: Update student type unions and label maps**

Extend local student question type unions:

```typescript
| "case_analysis"
| "calculation";
```

Treat both as subjective text-answer types:

```typescript
return (
  questionType === "short_answer" ||
  questionType === "case_analysis" ||
  questionType === "calculation"
);
```

- [ ] **Step 4: Run focused UI tests**

Run:

```powershell
npm.cmd run test:unit -- tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts
```

Expected: PASS.

## Task 6: Student Runtime Services

**Files:**

- Modify: `src/server/services/practice-service.ts`
- Modify: `src/server/services/mock-exam-service.ts`
- Modify: `src/server/services/paper-draft-service.ts`
- Modify: `src/server/services/practice-service.test.ts`
- Modify: `src/server/services/mock-exam-service.test.ts`
- Modify: `src/server/services/paper-draft-service.test.ts`

- [ ] **Step 1: Add RED service tests**

Add service tests proving `case_analysis` and `calculation` accept `textAnswer`, reject empty answers when required by existing submit rules, preserve snapshots, and contribute to total score/statistics.

- [ ] **Step 2: Run focused service tests**

Run:

```powershell
npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts
```

Expected: FAIL before runtime subjective-type guards include the new values.

- [ ] **Step 3: Update service guards**

Where services check subjective question types, include:

```typescript
question.questionType === "case_analysis" ||
  question.questionType === "calculation";
```

Do not add the legacy alias `subjective` to new data. Preserve existing compatibility only where already present.

- [ ] **Step 4: Run focused service tests**

Run:

```powershell
npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts
```

Expected: PASS.

## Task 7: Full Local Gates And Evidence

**Files:**

- Modify: implementation task evidence under `docs/05-execution-logs/evidence/`
- Modify: queue/state files for the implementation task

- [ ] **Step 1: Run targeted unit suites**

Run:

```powershell
npm.cmd run test:unit -- src/db/schema/paper.test.ts src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run E2E where content/student flows are affected**

Run:

```powershell
npm.cmd run test:e2e -- e2e/content-action-closures.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Run build and repository gates**

Run:

```powershell
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```

Expected: all pass.

- [ ] **Step 4: Evidence redaction check**

Confirm evidence contains no `.env.local`, secret, token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, or customer/private content.

## Implementation Approval Gate

Before executing Task 2 or any later runtime task, ask for explicit approval with this scope:

```text
Approve implementation of phase-12 question type schema expansion for case_analysis and calculation, including schema enum update, Drizzle migration generation, affected src runtime/UI/test changes, and local validation only. This approval does not allow dependency/package/lockfile changes, .env changes, provider calls, staging/prod/cloud work, deployment, destructive data operations, or recording sensitive/raw content.
```

## Taste Compliance Checklist For Future Implementation

- No cheap visual defaults: use existing tokens and UI components only.
- Loading/empty/error states: preserve existing admin/student state handling.
- Interaction feedback: preserve existing button/dialog/toast patterns.
- Tailwind order: rely on project Prettier/Tailwind formatting.
- No N+1 queries: repository changes must not add looped database selects.
- Schema-driven data: enum expansion must use Drizzle schema plus migration, never ad hoc SQL in services.
- API contract: response remains `{ code, message, data, pagination? }`; JSON fields remain camelCase.
- Comments: add comments only for migration or scoring decisions that are not self-evident.
- Naming: use only `case_analysis`, `calculation`, `question_type`, and existing glossary terms.
- Immutability: update React state with spread/map/filter, not mutation.
