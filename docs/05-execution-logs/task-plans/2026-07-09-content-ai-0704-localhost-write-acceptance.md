# 2026-07-09 Content AI 0704 Localhost Write Acceptance Plan

## Scope

- Task id: `content-ai-0704-localhost-write-acceptance-2026-07-09`
- Branch: `codex/content-ai-0704-localhost-write-acceptance`
- Goal: restart the local dev server with a process-only override to the explicit 20260704 local DB target, then use private role account material in memory to run localhost-only login and write-path acceptance.
- Approval: current user approved process-only 0704 DB override and in-memory private account login on 2026-07-09. Prior goal approval covers serial local commit, merge, push, and cleanup.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/*.md`
- Standard and advanced AI generation, RAG, content, learner, organization training, and authorization requirements.
- Current AI traceability overlays through 2026-07-08.
- Latest 0704 DB, content AI, organization AI, evidence, and audit records from 2026-07-07 through 2026-07-09.

## Execution Plan

1. Confirm `master` and `origin/master` are aligned before the short branch.
2. Stop the existing local port 3000 process only after confirming it is the local dev server listener.
3. Start the Next.js dev server with a process-only 0704 DB override; do not edit `.env*`, do not print env values or DB URL, and keep logs outside the repository.
4. Confirm `/login` reachability and redacted DB-target label match.
5. Read private account material outside the repo in memory only; do not print or commit values.
6. Perform localhost login and role-boundary acceptance with cookies/session state kept only in process memory.
7. Record only role labels, route labels, visible state labels, command statuses, aggregate counts, and safe failure categories.
8. If a real code defect is found, stop this branch at evidence and open a separate `codex/*` repair branch after root-cause confirmation.

## Acceptance Matrix

| Area                           | Expected acceptance                                                                                                                                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content AI出题                 | Content admin can use AI result review/adoption to reach formal question draft and explicit publish path.                                                        |
| Content AI组卷                 | Content admin can use plan/select result to reach formal paper draft detail and explicit publish path.                                                           |
| Organization advanced admin    | Organization AI output remains in organization/training domain and does not mix into formal content.                                                             |
| Organization advanced employee | Employee sees only published organization training and allowed learner AI training.                                                                              |
| Standard roles                 | Personal standard, organization standard employee/admin remain hidden, denied, upgrade-guided, or unavailable for advanced AI.                                   |
| Sensitive data                 | No credential, session, cookie, token, env value, DB URL, raw DB row, internal id, Provider payload, prompt, raw AI output, or full content appears in evidence. |

## Validation

- Targeted content AI UI/formal content tests.
- Targeted formal draft and paper service tests.
- Targeted personal learner AI tests.
- Targeted organization training and role navigation tests.
- `typecheck`, `lint`, `git diff --check`.
- Module Run v2 pre-commit and pre-push readiness.

## Boundary

- Provider-enabled execution: blocked.
- Staging/prod/deploy: blocked.
- Cost Calibration: blocked.
- Package/lockfile/dependency change: blocked.
- Schema/migration/seed change: blocked.
- Destructive DB operation: blocked.
- Screenshots/raw DOM/browser storage capture: blocked for this branch.
