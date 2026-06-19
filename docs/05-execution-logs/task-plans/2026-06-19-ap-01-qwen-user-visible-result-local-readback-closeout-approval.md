# AP-01 Qwen User-Visible Result Local Readback Closeout Approval Plan

## Task

- Task id: `ap-01-qwen-user-visible-result-local-readback-closeout-approval`
- Branch: `codex/ap-01-qwen-user-visible-result-local-readback-closeout-approval`
- Objective: approve the next local-only readback and user-visible verification boundary for the redacted result already
  persisted in local DB.

## Governance Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-user-visible-result-local-db-persistence-execution.md`

## Source Readback Path Inventory

- Collection route: `src/app/api/v1/personal-ai-generation-results/route.ts`
- Detail route: `src/app/api/v1/personal-ai-generation-results/[publicId]/route.ts`
- Route handlers: `src/server/services/personal-ai-generation-result-route.ts`
- History service: `src/server/services/personal-ai-generation-result-history-service.ts`
- Repository: `src/server/repositories/personal-ai-generation-result-repository.ts`
- Student UI: `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`

## Approval Boundary

- This approval task is docs/state only.
- This approval task must not read `.env.local`, must not read or output `DATABASE_URL`, must not query DB, and must not
  execute provider/model calls.
- The next execution task may read `.env.local` only for the `DATABASE_URL` alias in process, validate local/dev target,
  and perform read-only DB/API/service readback through existing paths.
- The next execution task may verify collection and detail readback for the persisted redacted result by counts/status
  only.
- The next execution task may verify user-visible DTO/display eligibility using existing route/service/UI data shape, but
  evidence may record only sanitized field presence and redaction states.

## Redaction Boundary

Evidence may record command names, pass/fail, target classification, count-only readback, sanitized field-presence
checks, `contentVisibility`, `redactionStatus`, `formalAdoptionWriteStatus`, and blocked gates. Evidence must not record
raw prompt, raw response, raw model output, provider payload, raw error text, request body, raw DB rows, public id
inventories, full `DATABASE_URL`, key, token, Authorization header, screenshots, traces, HTML reports, or raw/private
paper/material/question/answer content.

## Stop Conditions For Next Task

- Missing `DATABASE_URL`.
- DB target is not local/dev.
- Local DB unavailable.
- Existing persisted redacted result cannot be found by scoped readback.
- Existing route/service/read model cannot verify without source changes.
- Raw sensitive data would enter evidence or UI-visible proof.
- Provider call, schema/migration, dependency, source/test/script/e2e change, destructive DB work, formal adoption,
  staging/prod/deploy, or Cost Calibration Gate would be required.
