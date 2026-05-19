# Phase 4 Student Experience Planning Evidence

## Task

- Task id: `phase-4-student-experience-planning`
- Phase: `phase-4-student-experience`
- Branch: `codex/phase-4-student-experience-planning`
- Worktree: `F:\tiku\.worktrees\phase-4-student-experience-planning`
- Base: `master`
- Plan: `docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-experience-planning.md`

## User Request

The user noted that Phase 4 and Phase 5 preparation material should already exist in the repository:

- source papers in `rawfiles`;
- student experience decisions in requirements created through prior brainstorming;
- proceed with the semi-automation mechanism and stop only if a blocking question appears.

## Source Material Inventory

Initial repository scan found only one retained source file:

```text
rawfiles/营销类/2025年烟草制品购销员三至五级专业知识.pdf
```

The user clarified that complete materials should have existed under `rawfiles`. A follow-up recovery task found the missing files in local WeChat cache and restored them into ignored local `F:\tiku\rawfiles`.

Recovery evidence:

- `docs/05-execution-logs/task-plans/2026-05-19-rawfiles-recovery-and-inventory.md`
- `docs/05-execution-logs/evidence/2026-05-19-rawfiles-recovery-and-inventory.md`

Recovered local layout:

```text
rawfiles/
  专卖类/
    三级/      13 files
    四级/      13 files
    五级/      13 files
    教材/      1 file
    压缩包/    3 files
  营销类/
    三级/
      真题/      4 files
      模拟真题/  3 files
      系统课件/  11 files
    教材/      1 file
    课件/      3 files
  物流类/      reserved, empty
```

Recovered total:

```text
65 files
```

Observed metadata:

- File size: `289036579` bytes.
- PDF pages: `424`.
- PDF metadata creator/producer: `ApeosPort-IV C5575`.
- Text extraction check with `pypdf`:
  - page 1: `0` characters
  - page 2: `0` characters
  - page 3: `0` characters

Updated interpretation:

- The source material set is present locally again under ignored `rawfiles/`.
- 专卖类 covers levels 3, 4, and 5 with theory, skill, answer, material, and answer-sheet patterns from 2023.10, 2024.4, and 2024.11.
- 营销类 covers level 3 real papers, simulation papers, courseware, lecture notes, calculation-point material, and the 2025 professional knowledge textbook PDF for levels 3 to 5.
- 物流类 remains reserved with no first-batch source material.
- The file appears to be a scanned-image PDF, not an extractable-text PDF.
- Phase 4 can reference the recovered paper/raw material set as local source context.
- Phase 5 RAG ingestion should not assume this file can be directly converted to Markdown without OCR or manual transcription.

## Preserved Phase 4 Experience Decisions

Requirement sources:

- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/02-question-paper.md`

Student home:

- Show effective `authorization` scope by `profession` and `level`.
- Remember the last selected scope when multiple authorizations exist.
- Group papers by `subject`.
- Show `practice` and `mock_exam` entry points.
- Redirect users without authorization to redeem/contact guidance.

Practice:

- Theory practice is one question per page.
- Objective questions show correctness, standard answer, and `analysis` immediately after answer.
- Wrong objective answers enter `mistake_book`.
- Correct objective answers can still request `ai_explanation` in Phase 5.
- Skill practice is grouped by material/question group with collapsible material display.
- Subjective practice supports one `ai_hint`-driven retry in Phase 5.
- Practice progress is saved for 15 days.
- Re-entering practice offers continue/restart.
- One active practice progress per user and paper.
- Authorization loss terminates the active practice and hides unavailable content.

Mock exam:

- No correctness, standard answer, `analysis`, or AI hint during answering.
- Timed papers use server-side countdown.
- Untimed papers are manually submitted.
- Exit/reopen/cross-device continuation uses the same user-bound mock exam session.
- If time expires while away, server-side submit applies.
- Multiple attempts per paper are allowed.
- Submit warns about unanswered questions.
- Authorization loss terminates the mock exam as `terminated`; terminated attempts do not score or generate reports.
- Network failures show save failure, retry, and local temporary answer storage until recovery.

Exam report:

- Report includes total score, objective/subjective score, duration, and per-question detail.
- Report stores snapshots so later question/paper/knowledge changes do not rewrite history.
- Phase 5 may add `learning_suggestion`, `ai_scoring`, and RAG `citation` details.
- If AI learning suggestion generation fails later, the report score remains usable.

Mistake book:

- Phase 4 focuses on objective questions.
- Single choice, multi choice, true/false, and auto-match fill blank wrong answers can enter `mistake_book`.
- User can favorite, remove, and mark mastered.
- Records deduplicate by question.
- Marked mastered returns to unmastered if answered wrong again.
- Authorization loss hides matching content; renewed authorization restores visibility.
- Disabled source questions remain visible in existing mistake records with a disabled marker.

## Preserved Phase 5 Decisions Relevant To Phase 4 Planning

Requirement sources:

- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`

AI scoring:

- Subjective mock exam scoring is asynchronous after submit.
- A successfully scored answer is not rescored.
- Unanswered subjective questions score 0 without AI call.
- Score granularity is 0.5 and must not exceed max score.
- Failed scoring can be retried, with a Phase 5 maximum of 3 retries.
- `scoring_partial_failed` marks reports with partial subjective scoring failure.

AI explanation and hint:

- Objective wrong answers trigger `ai_explanation` automatically in Phase 5.
- Correct answers can trigger explanation manually.
- Explanation uses question, standard answer, `analysis`, and RAG hits.
- Insufficient RAG evidence must show an insufficient evidence message instead of fabricated citations.
- AI hint for subjective practice gives improvement direction, not the final answer, and supports at most one retry.

RAG and resource handling:

- RAG filters by `profession`, `level`, and resource status before retrieval.
- RAG returns `evidence_status`: `sufficient`, `weak`, or `none`.
- Student-side RAG must respect current effective `authorization`.
- Supported source uploads are DOCX, Markdown, PPTX, and extractable-text PDF.
- The discovered `rawfiles` PDF is likely scanned, so OCR/manual Markdown conversion is a known future ingestion risk.

## Phase 4 Queue Added

Added Phase 4 queue entries to `docs/04-agent-system/state/task-queue.yaml`:

```text
phase-4-rawfiles-recovery-inventory              done
phase-4-student-experience-planning              done
phase-4-student-experience-contract-approval     pending
phase-4-answer-record-schema-baseline            pending
phase-4-student-paper-access-baseline            pending
phase-4-practice-session-baseline                pending
phase-4-mock-exam-session-baseline               pending
phase-4-exam-report-baseline                     pending
phase-4-mistake-book-baseline                    pending
phase-4-student-home-ui-baseline                 pending
phase-4-practice-ui-baseline                     pending
phase-4-mock-exam-report-ui-baseline             pending
phase-4-student-experience-readiness-evidence    pending
```

The first actionable pending task is:

```text
phase-4-student-experience-contract-approval
```

`project-state.yaml` handoff was updated:

```text
nextRecommendedAction: claim_phase_4_student_experience_contract_approval
lastSummaryPath: docs/05-execution-logs/evidence/2026-05-19-phase-4-student-experience-planning.md
```

## Queue Rationale

Phase 4 is split so the public contracts are approved before code changes:

- Contract task first: records `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`, authorization, published paper snapshot, and API boundary rules.
- Schema baseline second: introduces answer/session/report/mistake-book storage only after contract approval.
- API/service baselines next: student paper access, practice, mock exam, reports, and mistake book are separated by workflow.
- UI baselines last: student home, practice, and mock exam/report UI depend on API/contracts.
- Readiness evidence closes Phase 4 after local gates pass.

Security review is required for contract, schema, API/service, and UI tasks because Phase 4 touches student authorization boundaries, session state, reports, and answer visibility.

## Validation

Validation commands declared by this planning task:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

```text
PASS powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
PASS powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
PASS npm.cmd run format:check
PASS powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Notable output:

```text
Test-AgentSystemReadiness.ps1:
OK file: AGENTS.md
OK file: docs\03-standards\code-taste-ten-commandments.md
OK file: docs\02-architecture\adr\adr-001-tech-stack-selection.md
OK file: docs\02-architecture\adr\adr-002-runtime-architecture-and-multi-client-contract.md
OK file: docs\02-architecture\adr\adr-003-workplace-desktop-web-compatibility.md
OK file: docs\04-agent-system\state\project-state.yaml
OK file: docs\04-agent-system\state\task-queue.yaml
OK npm script: lint
OK npm script: typecheck
OK npm script: test
OK npm script: test:unit
OK npm script: format:check
```

```text
Test-NamingConventions.ps1:
== Result ==
naming convention scan completed
```

```text
npm.cmd run format:check:
Checking formatting...
All matched files use Prettier code style!
```

```text
Test-GitCompletionReadiness.ps1:
branch: codex/phase-4-student-experience-planning
head: 8eb8ee6
base: origin/master
commitsAhead:
8eb8ee6 docs(agent): record rawfiles recovery inventory
filesChangedAgainstBase:
docs/05-execution-logs/evidence/2026-05-19-rawfiles-recovery-and-inventory.md
docs/05-execution-logs/task-plans/2026-05-19-rawfiles-recovery-and-inventory.md
== Result ==
git completion readiness inventory completed
```

## Git Closeout

Pending commit for the Phase 4 planning state changes.
