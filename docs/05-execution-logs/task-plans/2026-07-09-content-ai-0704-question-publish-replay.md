# Content AI 0704 Question Publish Replay Plan

## Scope

- Task id: `content-ai-0704-question-publish-replay-2026-07-09`
- Branch: `codex/content-ai-0704-question-publish-replay`
- Goal: replay content AI出题 no-Provider path from accepted formal question draft to user-usable published question.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- AI generation, advanced edition, authorization, and closed-loop traceability documents read earlier in this 2026-07-09 recovery turn.
- Content AI result/adoption/formal draft code read earlier in this turn.
- Question update route/service/validator code for this task:
  - `src/server/services/content-question-material-runtime.ts`
  - `src/server/services/question-service.ts`
  - `src/server/validators/question.ts`

## Implementation Plan

1. Confirm master/origin baseline and local 0704 localhost readiness without printing DB URLs, credentials, or session material.
2. Use private content admin credentials in process memory only to read the content AI出题 target from the already refreshed history.
3. Read the formal question draft detail through the public API without recording full stem/options/answer/analysis.
4. Submit a content question update that preserves the existing redacted formal draft payload and changes only status from `disabled` to `available`.
5. Verify through aggregate/status-only probes:
   - content AI出题 history still has an approved draft-created target;
   - formal question detail is `available`;
   - learner-visible question list can find the published question by metadata/status without exposing full content.
6. Run targeted tests, lint, typecheck, diff check, Module Run v2 gates.
7. Write redacted evidence/audit, commit, fast-forward merge to master, run master gates, push, and delete the short branch.

## Boundaries

- Localhost / local 0704 DB only.
- No Provider call.
- No direct DB mutation unless read-only aggregate confirmation is needed; product write must go through localhost API.
- No screenshot or raw DOM.
- No credentials, session/cookie/token/localStorage/Auth header, env values, DB URL, raw DB rows, internal numeric ids, Provider payload, raw prompt/output, or full question/paper/material/resource/chunk content in evidence or chat.
- No source, test, package, lockfile, schema, migration, or seed change unless a true current-code defect is separately proven and handled in a new short branch.
- Do not touch personal advanced learner, organization advanced employee, or organization advanced admin AI source implementations.

## Validation Plan

- Redacted localhost API aggregate before/after publish replay.
- Targeted content AI/question tests.
- Targeted personal learner AI regression tests.
- Targeted organization/admin/employee regression tests.
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 typecheck`
- `git diff --check`
- Module Run v2 precommit/prepush gates.
