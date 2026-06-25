# Role-Separated Full 8-Row Post-Org-Admin Repair Rerun Scope Package

## Package Identity

- Package id: `ROLE_SEPARATED_FULL_8_ROW_POST_ORG_ADMIN_REPAIR_RERUN_SCOPE_2026_06_25`.
- Prepared by task: `role-separated-full-8-row-post-org-admin-repair-rerun-scope-package-2026-06-25`.
- Status: prepared only; not approved for execution by this package-preparation task.
- Purpose: define a future local real-browser rerun for all eight role-separated rows after organization admin repair.
- Non-claim: this package does not declare Standard MVP or Advanced MVP final Pass.

## Approval Required For Future Execution

Future execution requires fresh explicit owner approval naming this package id. Without that approval, agents must not open a browser, ask for or observe credential entry, inspect routes, run Playwright, start a dev server, read account/credential files, connect to DB, mutate accounts, or write runtime evidence.

## Account Input And Credential Policy

- laozhuang manually selects and enters credentials for each role row in the browser.
- Codex must not read private account files, `.env*`, notes, password managers, credential documents, tokens, cookies, localStorage, sessionStorage, Authorization headers, or database rows.
- Codex must not type, paste, store, echo, screenshot, or summarize password values.
- Evidence may refer only to a role row and a redacted owner-provided account label such as `owner-entered personal_standard_student account`.

## Rows In Scope

1. `personal_standard_student`
2. `personal_advanced_student`
3. `org_standard_employee`
4. `org_advanced_employee`
5. `org_standard_admin`
6. `org_advanced_admin`
7. `content_admin`
8. `ops_admin`

## Route And Workflow Matrix

| Role row                    | Required landing or entry                                              | Allowed behavior to observe                                                                                                                                                                                                                               | Denied or unavailable behavior to observe                                                                                                                                                                                  | Strict failure triggers                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Learner home, expected `/home` or equivalent learner landing.          | Standard learning only: authorized `profession`/`level`, theory/skill paper groups, practice and mock entry.                                                                                                                                              | No visible `AI训练`; direct `/ai-generation` must deny or show standard-unavailable/upgrade guidance; `/ops/users`, `/content/papers`, and `/organization/portal` must not expose backend workspaces.                      | Visible `personal-learning-ai`; logged-in direct route says `请先登录`; advanced AI actions exposed as usable; backend workspace exposed.                   |
| `personal_advanced_student` | Learner home with discoverable `AI训练`.                               | `AI训练` entry visible; `/ai-generation` shows `AI出题` and `AI组卷` as usable local or safely Provider-gated actions; no formal `question` or `paper` write.                                                                                             | `/ops/users`, `/content/papers`, and `/organization/portal` denied.                                                                                                                                                        | No home `AI训练`; direct AI route says `请先登录`; technical English label visible; backend workspace exposed.                                              |
| `org_standard_employee`     | Standard organization-authorized learner home.                         | Standard learning only: theory/skill, practice, mock, valid organization authorization summary if visible.                                                                                                                                                | No `AI训练`; no `企业训练`; direct `/ai-generation` and `/organization-training` deny or show standard-unavailable guidance; no admin/content/ops workspace.                                                               | Advanced AI or enterprise training reachable as usable; direct route says `请先登录`; technical English label visible; backend workspace exposed.           |
| `org_advanced_employee`     | Advanced organization-authorized learner home.                         | Discoverable `AI训练` and `企业训练`; `/ai-generation` uses logged-in organization context or safe Provider-gated state; `/organization-training` shows assigned training or Chinese organization-scoped empty state.                                     | No admin/content/ops workspace outside scoped organization.                                                                                                                                                                | Missing home entries; direct AI route says `请先登录`; organization training lacks logged-in organization context; backend workspace exposed.               |
| `org_standard_admin`        | `/organization/portal`.                                                | Organization-scoped employee management and authorization/status viewing; logout visible and functional.                                                                                                                                                  | `/organization/organization-training`, `/organization/ai-question-generation`, and `/organization/ai-paper-generation` deny or show standard-unavailable; `/ops/users`, `/ops/redeem-codes`, and `/content/papers` denied. | Lands in `/ops/*`; organization binding missing; standard admin can use enterprise training or organization AI; ops/content exposed; logout broken.         |
| `org_advanced_admin`        | `/organization/portal`.                                                | Organization portal, employee/auth status, `/organization/organization-training`, `/organization/organization-analytics`, `/organization/ai-question-generation`, and `/organization/ai-paper-generation` reachable with safe local or Provider-gated UI. | `/ops/users`, `/ops/redeem-codes`, and `/content/papers` denied.                                                                                                                                                           | Lands in `/ops/*`; organization routes denied; ops/content exposed; visible technical labels fail strict UI check; logout broken.                           |
| `content_admin`             | Content backend workspace.                                             | `/content/papers`, `/content/ai-question-generation`, and `/content/ai-paper-generation` reachable as draft/review workflows without formal write or Provider invocation.                                                                                 | `/ops/redeem-codes`, `/ops/organizations`, `/ops/users`, and `/organization/portal` denied.                                                                                                                                | Content AI entries missing; ops/org workspace exposed; visible technical labels such as `publicId`, `paper`, `question`, or `Provider` remain user-visible. |
| `ops_admin`                 | Operations workspace, expected `/ops/users` or equivalent ops landing. | `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`, and `/ops/ai-audit-logs` reachable; forms can be inspected without submit or generation.                                                                                                         | `/content/papers`, `/content/ai-question-generation`, `/content/ai-paper-generation`, and `/organization/portal` denied.                                                                                                   | Content/org workspace exposed; plaintext `redeem_code` values visible; Provider controls are interacted with; visible technical labels remain user-visible. |

## Allowed Evidence Fields

- `packageId`
- `roleRowName`
- `redactedAccountLabel`
- `ownerCredentialEntryStatus`
- `loginLandingPath`
- `sanitizedSessionStatus`
- `roleLabel`
- `organizationBindingPresence`
- `allowedRouteOrWorkflowLabel`
- `allowedRouteOrWorkflowStatus`
- `deniedRouteOrWorkflowLabel`
- `deniedRouteOrWorkflowStatus`
- `visibleUiLanguageCheck`
- `safeActionControlState`
- `logoutStatus`
- `consoleErrorWarnCount`
- `rowResult`
- `blockerClass`
- `redactedNotes`

## Redaction Policy

Evidence must not include passwords, phones, emails, credential file contents, raw account identifiers, publicId values, tokens, cookies, localStorage, sessionStorage, Authorization headers, `.env*`, database URLs, raw DB rows, screenshots, traces, HTML dumps, raw page dumps, prompts, Provider payloads, raw generated AI output, private answers, full `question` or `paper` content, plaintext `redeem_code`, or external-service payloads.

## Blocked Scopes

Blocked unless a later task carries fresh explicit approval:

- actual browser or Playwright runtime execution;
- credential document reads or credential entry by Codex;
- account creation, disablement, password reset, seed, or fixture mutation;
- DB read/write, schema, migration, `drizzle-kit push`, or destructive database work;
- source, test, e2e, script, package, or lockfile changes;
- `.env*`, secrets, Provider calls/configuration, Cost Calibration, staging/prod/cloud/deploy, payment, external services;
- PR creation/update, force push, production release, final Standard/Advanced MVP Pass.

## Result Policy For Future Execution

Future evidence may record each row as `pass`, `fail`, or `blocked`. The eight-row gate remains blocked if any row fails, is blocked, is not observed, or violates redaction. Even an eight-row local pass is not final MVP Pass without a separate final acceptance decision.
