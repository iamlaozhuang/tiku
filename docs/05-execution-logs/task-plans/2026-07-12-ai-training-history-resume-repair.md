# 2026-07-12 AI Training History Resume Repair Plan

## Task

- Task id: `user-led-ai-training-history-resume-repair-2026-07-12`
- Branch: `codex/ai-training-history-resume`
- Start SHA: `89a14a3e4271fa62714c37e4e593818660900dff`
- Approval: current user explicitly approved short-branch implementation, commit, ff-only merge to `master`, push to `origin/master`, and cleanup.

## Restored Sources

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- all records under `docs/02-architecture/adr/`, including ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- current AI requirements SSOT, phase4 recovery guard, closed-loop target, recontract overlay, acceptance baseline, goal-completion audit, learner AI final regression, paper preview, and learning-session handoff evidence.

## Fresh Failure Evidence

1. Selecting `AI组卷` changes `activeTaskType` but leaves request/result history bound to the initial `AI出题` state until a generation request succeeds. Provider-closed users therefore see mismatched mode and history data.
2. A successful AI paper result is answerable only while the in-memory `experience` survives. Persisted result detail contains the actor-scoped task/evidence/paper assembly references, but the learning-session route accepts browser-supplied assembly state and the UI cannot start or resume from history after refresh.

## Implementation

1. Make the active AI mode the history query source of truth. On mode changes, clear cross-mode detail, reset pagination, fetch both histories, and ignore stale responses.
2. Add an actor- and owner-scoped repository lookup for one persisted result by `resultPublicId`.
3. In production learning-session wiring, resolve AI paper sessions from the persisted result. Derive the deterministic session id server-side, reject incomplete/insufficient results, rehydrate only authoritative platform or employee-visible enterprise sources, and ignore browser-supplied paper assembly state.
4. Make paper-session creation idempotently reuse the persisted session snapshot when the same actor/result/session is already present; fail closed on a context collision.
5. Use the same server-owned path for a newly generated paper and a historical paper. Add a history action for eligible assembled papers, restore existing answer feedback, and enable submit/analysis only after a session is loaded.
6. Preserve the current generated-question path because historical AI question output remains intentionally redacted and cannot be reconstructed from the result snapshot.

## Risk Defenses

- No Provider call, prompt change, credential read, raw output capture, direct DB connection, schema/migration/fixture change, dependency change, staging, production, or deploy.
- No automatic formal `question`, `paper`, `practice`, `answer_record`, `exam_report`, or `mistake_book` write.
- Personal results stay actor/personal-owner scoped. Employee results must match the current actor and either the actor's personal owner scope or current organization owner scope.
- Repeated start/continue actions reuse one deterministic learning session.
- Missing, withdrawn, inaccessible, cross-actor, cross-organization, insufficient, or malformed sources fail closed without partial session persistence.
- Provider-closed mode remains navigable and history-readable but cannot submit generation requests.

## Verification

- TDD RED/GREEN for mode/history synchronization.
- TDD RED/GREEN for persisted personal and organization paper result resume, client assembly tamper resistance, idempotent reuse, collision rejection, and source failure.
- Focused learner AI UI, result repository, result history, learning route/service/source resolver/repository tests.
- Full unit suite, lint, typecheck, format check, webpack build, and `git diff --check`.
- Redacted localhost browser checks for personal advanced and organization advanced employee in Provider-closed mode, including mode/history labels, history action states, containment, and console errors. No generation POST.
- Module Run v2 pre-commit, module closeout, and pre-push gates.
- Adversarial review of direct URL, actor/owner isolation, cross-organization access, client tampering, repeated actions, stale responses, missing sources, sensitive output, and formal-write boundaries.

## Closeout

- One reviewable task commit.
- Fast-forward merge into `master`, verify on merged `master`, push ordinary `origin/master`, confirm compare `0/0`, then remove the owned worktree and merged short branch.
