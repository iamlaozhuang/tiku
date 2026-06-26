# Full Eight-Row Post Ops Visible-Label Repair Browser Rerun Task Plan

Task id: `role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun-2026-06-26`

## Fresh Approval

This task is executed under the active goal approval for serial local role-separated browser validation with approved
private local credentials. The predecessor focused repair closed the sampled `ops_admin` visible technical-label blocker.

## Task Type

Browser-only full eight-row local runtime rerun with redacted evidence.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence Inputs

- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-26-ops-admin-visible-technical-label-residual-cleanup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-ops-admin-visible-technical-label-residual-cleanup.md`

## Allowed Scope

- Read the approved local private role-account credential file and input credentials only into the local browser login
  form.
- Execute local browser checks against `http://127.0.0.1:3000`.
- Record only role labels, route labels, status/count summaries, visible target-token counts, browser issue count, and
  pass/fail/blocked status.
- Update task plan, evidence, audit-review, project state, and task queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after gates pass.

## Blocked Scope

- Source/test/package/lockfile changes.
- DB reads/writes, seed writes, schema changes, migrations, Drizzle schema changes, or account/user/employee/
  authorization mutation.
- Reading or writing `.env*`.
- Provider calls or Provider configuration.
- Cost Calibration Gate, staging/prod/cloud/deploy, payment, external services, PR, force-push, or final MVP Pass claim.
- Evidence containing raw credentials, account identifiers, tokens, cookies, local/session storage, Authorization
  headers, raw DB rows, raw public ids, raw DOM dumps, screenshots, traces, Provider payloads, prompts, generated
  content, or private answer content.

## Runtime Matrix

- `personal_standard_student`
- `personal_advanced_student`
- `org_standard_employee`
- `org_advanced_employee`
- `org_standard_admin`
- `org_advanced_admin`
- `content_admin`
- `ops_admin`

## Validation Plan

- `npx.cmd playwright --version`
- `Invoke-WebRequest http://127.0.0.1:3000/login`
- Private credential structure check with role labels only.
- Local real-browser full eight-row rerun with redacted compact matrix.
- `npx.cmd prettier --check --ignore-unknown` on changed docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-ops-visible-label-repair-browser-rerun-2026-06-26 -SkipRemoteAheadCheck`
