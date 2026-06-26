# Role-Separated Full 8 Row Post Visible-Label Private Credential Browser Rerun Evidence

Task id: `role-separated-full-8-row-post-visible-label-private-credential-browser-rerun-2026-06-26`

Branch: `codex/full-8-post-visible-private-rerun-20260626`

## Scope Guard

- Browser runtime executed: yes, local `http://127.0.0.1:3000` only.
- Approved local private credential file read executed: yes.
- Credential entry executed: yes, into the local login form only.
- Credential values recorded: no.
- Source/test/package/lockfile changes executed: no.
- DB/seed/schema/migration/account mutation executed: no task-directed mutation. Local auth session creation/logout occurred only as browser authentication side effects.
- Provider/Cost/staging/prod/payment/external-service executed: no.
- Standard/Advanced MVP final Pass claim: blocked.
- Raw account identifiers, phone numbers, passwords, tokens, cookies, local/session storage, raw DB rows, raw public ids, screenshots, traces, raw DOM, Provider payloads, prompts, generated content, private answer content, or full question/paper content recorded: no.

## Acceptance Mapping Result

Strict row result: `7 pass / 1 fail / 0 blocked`.

No Standard/Advanced MVP final Pass is claimed because `ops_admin` still has visible technical labels on sampled operations routes.

| Row                         | Landing                | Primary allow result                                                                                                          | Boundary result                                 | Strict result | Remaining blocker summary                                                        |
| --------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| `personal_standard_student` | `/home`                | Home has no `AI训练` or `企业训练`; `/ai-generation` buttons `0/1`, `0/1` enabled.                                            | Ops/content/organization backend routes denied. | pass          | None for sampled strict paths.                                                   |
| `personal_advanced_student` | `/home`                | Home has `AI训练`; `/ai-generation` buttons `1/1`, `1/1` enabled.                                                             | Ops/content/organization backend routes denied. | pass          | None for sampled strict paths.                                                   |
| `org_standard_employee`     | `/home`                | Home has no `AI训练` or `企业训练`; `/ai-generation` buttons `0/1`, `0/1`; training rows/actions `0`.                         | Ops/content/organization backend routes denied. | pass          | None for sampled strict paths.                                                   |
| `org_advanced_employee`     | `/home`                | Home has `AI训练` and `企业训练`; `/ai-generation` buttons `1/1`, `1/1`; training rows/inputs/actions `1/3/3`.                | Ops/content/organization backend routes denied. | pass          | None for sampled strict paths.                                                   |
| `org_standard_admin`        | `/organization/portal` | Organization portal reachable; no advanced training or AI links; direct organization routes show standard-unavailable states. | Ops/content routes denied.                      | pass          | None for sampled strict paths.                                                   |
| `org_advanced_admin`        | `/organization/portal` | Organization portal exposes `企业训练`, `AI出题`, and `AI组卷`; direct organization routes reachable.                         | Ops/content routes denied.                      | pass          | None for sampled strict paths.                                                   |
| `content_admin`             | `/content/papers`      | Content papers and content `AI出题`/`AI组卷` routes reachable; sampled visible technical labels absent.                       | Ops/organization routes denied.                 | pass          | None for sampled strict paths.                                                   |
| `ops_admin`                 | `/ops/users`           | Ops users, organizations, and redeem-code routes reachable.                                                                   | Content and organization routes denied.         | fail          | Visible technical labels remain on `/ops/organizations` and `/ops/redeem-codes`. |

### Compact Evidence Fields

| Row                         | Home / AI route evidence                                      | Organization training evidence                           | Backend boundary sample                                                | Browser issues |
| --------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- | -------------- |
| `personal_standard_student` | home `AI=0`, `orgTraining=0`; AI buttons `0/1`, `0/1` enabled | rows/inputs/actions `0/0/0`                              | ops/content/organization denied                                        | `0`            |
| `personal_advanced_student` | home `AI=1`; AI buttons `1/1`, `1/1` enabled                  | rows/inputs/actions `0/0/0`                              | ops/content/organization denied                                        | `0`            |
| `org_standard_employee`     | home `AI=0`, `orgTraining=0`; AI buttons `0/1`, `0/1` enabled | rows/inputs/actions `0/0/0`                              | ops/content/organization denied                                        | `0`            |
| `org_advanced_employee`     | home `AI=1`, `orgTraining=1`; AI buttons `1/1`, `1/1` enabled | rows/inputs/actions `1/3/3`                              | ops/content/organization denied                                        | `0`            |
| `org_standard_admin`        | not applicable                                                | standard-unavailable organization training and AI routes | ops/content denied                                                     | `0`            |
| `org_advanced_admin`        | not applicable                                                | portal links `training=2`, `AI出题=2`, `AI组卷=2`        | ops/content denied                                                     | `0`            |
| `content_admin`             | not applicable                                                | not applicable                                           | content routes reachable; ops/organization denied; tech tokens absent  | `0`            |
| `ops_admin`                 | not applicable                                                | not applicable                                           | ops routes reachable; content/organization denied; tech tokens present | `0`            |

### Remaining Blocker Detail

The remaining failing row is `ops_admin`.

Token-type diagnostic, redacted to booleans only:

| Ops route            | `publicId` | `org_auth` | `runtime API` | `contact_config` | raw role names |
| -------------------- | ---------- | ---------- | ------------- | ---------------- | -------------- |
| `/ops/users`         | false      | false      | false         | false            | false          |
| `/ops/organizations` | true       | true       | true          | false            | false          |
| `/ops/redeem-codes`  | false      | false      | false         | true             | false          |

Next smallest repair:
`ops-admin-visible-technical-label-residual-cleanup-2026-06-26`.

## Validation Results

- `npx.cmd playwright --version`: passed, Playwright `1.60.0`.
- `Invoke-WebRequest http://127.0.0.1:3000/login`: passed, status `200`.
- Private credential file structure check: passed, all 8 mandatory role labels and login/password field categories present; no credential values printed or recorded.
- Local real-browser full 8 row rerun: executed, `7 pass / 1 fail / 0 blocked`.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-visible-label-private-credential-browser-rerun-2026-06-26`: pending.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-full-8-row-post-visible-label-private-credential-browser-rerun-2026-06-26`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-full-8-row-post-visible-label-private-credential-browser-rerun-2026-06-26 -SkipRemoteAheadCheck`: initial run failed because the durable state checkpoint still referenced the pre-current-task `da367198f...` master/origin SHA while Git was already at `43d057b...`; repaired by updating the accepted checkpoint in `project-state.yaml`; rerun passed.

## Closeout Result

Pending commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup.

No Standard/Advanced MVP final Pass is claimed.
