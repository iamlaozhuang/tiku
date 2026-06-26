# Role-Separated Full 8 Row Post Org-Training Visible-List Repair Browser Rerun Evidence

Task id: `role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun-2026-06-25`

Branch: `codex/full-8-row-visible-list-rerun-20260625`

## Fresh Approval

The active goal and prior user approval allow continuing to a full eight-row role-separated browser rerun after the
focused organization-training visible-list repair passed. Credentials may be read/input locally with redacted evidence
only.

## Scope Guard

- Browser runtime executed: yes, local `http://127.0.0.1:3000` only.
- Credential document read by Codex: yes, from the approved local private role-account file.
- Credential entry by Codex: yes, into the local browser login form only.
- Source/test/package/lockfile edits executed: no.
- DB/seed/schema/migration executed: no.
- Account/user/employee/authorization mutation executed: no.
- Provider/Cost/staging/prod/payment/external-service executed: no external call, no configuration, no mutation, no
  pricing/quota measurement. One discarded full-json browser observation passively loaded the local ops AI audit page and
  issued local read-only `model-provider`/`model-config` API GETs; the final evidence table avoided that route.
- Raw credentials, account identifiers, tokens, cookies, local/session storage, raw DB rows, raw public ids, raw DOM,
  screenshots, traces, Provider payloads, prompts, generated content, or private answer content recorded: no.
- Standard/Advanced MVP final Pass claimed: no.

## Runtime Results

### Command Attempts

| Attempt                         | Result                                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Credential-file structure check | passed; all eight role labels present; no credential values printed.                               |
| Credential parser dry run       | passed after anchoring on `role row:`; all eight rows parsed; no credential values printed.        |
| Browser form-state dry run      | passed with isolated contexts and keyboard input; all eight rows enabled the submit button.        |
| Full-json browser rerun         | executed all rows but output exceeded tool context; discarded as primary evidence.                 |
| Compact table browser rerun     | passed as the primary evidence source below; all values are role/path/status/count summaries only. |
| `npx.cmd playwright --version`  | pending validation section.                                                                        |

Discarded browser scripts did not print credentials, tokens, cookies, raw DOM, local/session storage, or account
identifiers. The discarded full-json run is retained only as process context; the primary evidence is the compact table
rerun.

### Strict Row Matrix

Strict row acceptance result: `2 pass / 6 fail / 0 blocked`.

The organization-training visible-list 500 blocker is closed for `org_advanced_employee`, but the full eight-row strict
gate remains blocked. No Standard/Advanced MVP final Pass is claimed.

| Row                         | Landing                | Primary allow result                                                                                           | Boundary result                                                                                         | Strict result | Remaining blocker summary                                                                 |
| --------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| `personal_standard_student` | `/home`                | Home has no `AI训练` or `企业训练` entry; no enabled AI buttons on direct `/ai-generation`.                    | Backend routes returned local login; `/organization-training` returned visible-list `200/403074`.       | fail          | Direct `/ai-generation` still renders the AI page instead of explicit denial/unavailable. |
| `personal_advanced_student` | `/home`                | Home has `AI训练`; `/ai-generation` has `AI出题` enabled.                                                      | Organization training unavailable with `200/403074`; backend routes returned local login.               | fail          | `AI组卷` remains visible but disabled, so the full advanced AI action pair is unproven.   |
| `org_standard_employee`     | `/home`                | Home has no `AI训练` or `企业训练`; `/organization-training` has `0` rows, `0` inputs, `0` actions.            | visible-list returned `200/409076`; backend/admin routes returned local login.                          | fail          | Direct `/ai-generation` still renders the AI page instead of explicit denial/unavailable. |
| `org_advanced_employee`     | `/home`                | Home has `AI训练` and `企业训练`; `/organization-training` has `1` row, `3` numeric inputs, `3` actions.       | visible-list returned `200/0`; backend/admin routes returned local login.                               | fail          | Enterprise training passes; `AI组卷` remains disabled on `/ai-generation`.                |
| `org_standard_admin`        | `/organization/portal` | Organization portal reachable; no advanced organization portal links; direct org training shows unavailable.   | `/ops/users`, `/ops/redeem-codes`, and `/content/papers` show no-access states.                         | pass          | None for sampled strict role-separation paths.                                            |
| `org_advanced_admin`        | `/organization/portal` | Portal exposes organization training and organization `AI出题`/`AI组卷`; direct organization routes reachable. | `/ops/users`, `/ops/redeem-codes`, and `/content/papers` show no-access states.                         | pass          | None for sampled strict role-separation paths.                                            |
| `content_admin`             | `/content/papers`      | Content papers plus content `AI出题` and `AI组卷` routes reachable; content nav links present.                 | `/ops/users`, `/ops/redeem-codes`, and `/organization/portal` show no-access states.                    | fail          | Runtime still exposes visible technical label `publicId` on content papers.               |
| `ops_admin`                 | `/ops/users`           | Ops users, organizations, and redeem-code routes reachable with ops nav links.                                 | `/content/papers`, `/content/ai-question-generation`, and `/organization/portal` show no-access states. | fail          | Runtime still exposes visible technical labels including `org_auth`, role names, etc.     |

### Compact Evidence Fields

The compact browser table recorded these sampled route facts:

| Row                         | Home entries / AI route                                       | Organization training route                           | Admin/content/ops boundary sample                            | Browser issues |
| --------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ | -------------- |
| `personal_standard_student` | home `AI=0`, `orgTraining=0`; AI buttons `0/1`, `0/1` enabled | rows/inputs/actions `0/0/0`; visible-list `403074`    | ops/content/org-admin routes returned `/login`               | `0`            |
| `personal_advanced_student` | home `AI=1`; AI buttons `1/1`, `0/1` enabled                  | rows/inputs/actions `0/0/0`; visible-list `403074`    | ops/content/org-admin routes returned `/login`               | `0`            |
| `org_standard_employee`     | home `AI=0`, `orgTraining=0`; AI buttons `0/1`, `0/1` enabled | rows/inputs/actions `0/0/0`; visible-list `409076`    | ops/content/org-admin routes returned `/login`               | `0`            |
| `org_advanced_employee`     | home `AI=1`, `orgTraining=1`; AI buttons `1/1`, `0/1` enabled | rows/inputs/actions `1/3/3`; visible-list `0`         | ops/content/org-admin routes returned `/login`               | `0`            |
| `org_standard_admin`        | not applicable                                                | direct org training standard-unavailable; no actions  | ops/content denied; org portal reachable                     | `0`            |
| `org_advanced_admin`        | not applicable                                                | org portal links `training=2`, `AI出题=2`, `AI组卷=2` | ops/content denied; org training/AI direct routes reachable  | `0`            |
| `content_admin`             | not applicable                                                | not applicable                                        | content routes reachable; ops/org routes denied; `publicId`  | `0`            |
| `ops_admin`                 | not applicable                                                | not applicable                                        | ops routes reachable; content/org routes denied; tech labels | `0`            |

## Validation Results

- `npx.cmd playwright --version`: passed, Playwright `1.60.0`.
- Local real-browser compact full eight-row rerun: executed; strict result `2 pass / 6 fail / 0 blocked`.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md`:
  passed.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md docs/05-execution-logs/evidence/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun.md`:
  passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun-2026-06-25`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-org-training-visible-list-repair-browser-rerun-2026-06-25 -SkipRemoteAheadCheck`:
  passed.

## Closeout Result

Pending commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup.

No Standard/Advanced MVP final Pass is claimed.
