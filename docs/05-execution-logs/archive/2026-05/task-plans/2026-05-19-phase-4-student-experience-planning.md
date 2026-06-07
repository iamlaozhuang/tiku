# Task Plan: phase-4-student-experience-planning

## Goal

Create the Phase 4 student experience execution queue and record the durable context needed for Phase 4 and Phase 5 planning, including the `rawfiles` source material inventory and already-decided experience rules from requirements.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-3-question-paper-readiness.md`

## Scope

- Task id: `phase-4-student-experience-planning`
- Branch: `codex/phase-4-student-experience-planning`
- Worktree: `F:\tiku\.worktrees\phase-4-student-experience-planning`
- Base: `master`

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-experience-planning.md`
- `docs/05-execution-logs/evidence/2026-05-19-phase-4-student-experience-planning.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked tracked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `.env.example`
- `rawfiles/**` remains ignored and must not be committed; local recovery/organization is documented separately in `2026-05-19-rawfiles-recovery-and-inventory.md`.

## Context To Preserve

1. `rawfiles` was recovered from local WeChat cache and organized under:
   - `rawfiles/专卖类/三级`
   - `rawfiles/专卖类/四级`
   - `rawfiles/专卖类/五级`
   - `rawfiles/专卖类/教材`
   - `rawfiles/专卖类/压缩包`
   - `rawfiles/营销类/三级/真题`
   - `rawfiles/营销类/三级/模拟真题`
   - `rawfiles/营销类/三级/系统课件`
   - `rawfiles/营销类/教材`
   - `rawfiles/营销类/课件`
   - `rawfiles/物流类`
2. Recovered inventory totals 65 local files:
   - `profession: monopoly`: 三/四/五级真题、答案、材料卷、答题卷、教材、原始 rar 包。
   - `profession: marketing`: 三级真题、模拟真题、11 份系统课件、教材 PDF、课件/讲稿/计算题专项。
   - `profession: logistics`: reserved empty directory; no first-batch source material found.
3. Detailed recovery evidence is recorded in `docs/05-execution-logs/evidence/2026-05-19-rawfiles-recovery-and-inventory.md`.
4. Marketing textbook PDF detail:
   - `rawfiles/营销类/教材/2025年烟草制品购销员三至五级专业知识.pdf`
   - Size: `289036579` bytes
   - PDF pages: `424`
   - Extracted text from first three pages: `0` characters, likely scanned image PDF.
5. Phase 5 RAG risk:
   - Current RAG requirement supports DOCX / Markdown / PPTX / extractable-text PDF.
   - This PDF is not currently extractable text, so OCR or manual Markdown conversion must be planned before using it as `knowledge_base`/`resource` content.
6. Experience rules are already recorded in requirements and do not need fresh product decisions unless implementation exposes a contradiction.

## Planning Decisions

1. Phase 4 starts with a student experience contract task because `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`, authorization visibility, and published paper snapshots cross data, API, and authorization boundaries.
2. Phase 4 implementation should separate data/schema, student paper access, practice, mock exam, reports, mistake book, and UI baselines into reviewable tasks.
3. AI scoring, AI explanation, AI hint, RAG citation generation, model invocation, and knowledge recommendation remain Phase 5 implementation concerns. Phase 4 should provide placeholders/states where required but must not fabricate AI results.
4. Phase 4 UI is mobile-first for students and must include loading, empty, and error states.
5. Phase 4 must use Phase 3 published paper snapshots for practice and mock exam display, not mutable source `question` rows.

## Phase 4 Queue Shape

The queue will add:

1. `phase-4-student-experience-planning`
2. `phase-4-student-experience-contract-approval`
3. `phase-4-answer-record-schema-baseline`
4. `phase-4-student-paper-access-baseline`
5. `phase-4-practice-session-baseline`
6. `phase-4-mock-exam-session-baseline`
7. `phase-4-exam-report-baseline`
8. `phase-4-mistake-book-baseline`
9. `phase-4-student-home-ui-baseline`
10. `phase-4-practice-ui-baseline`
11. `phase-4-mock-exam-report-ui-baseline`
12. `phase-4-student-experience-readiness-evidence`

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
npm.cmd run format:check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

## Evidence Plan

- Record rawfiles inventory and PDF extraction check.
- Record requirement sources for Phase 4/5 decisions.
- Record the Phase 4 queue entries, dependencies, risk gates, and validation commands.
- Record validation command results and git inventory.
