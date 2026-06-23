# Role Separated Account Seeded Local Or Owner Exclusion Scope Approval Package

packageId: ROLE_SEPARATED_SEEDED_LOCAL_OR_OWNER_EXCLUSION_SCOPE_2026_06_23
taskId: acceptance-role-separated-account-seeded-local-or-owner-exclusion-scope-approval-2026-06-23
packageStatus: prepared_not_approved_for_execution
preparedAt: "2026-06-23T06:55:40-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only

## Plain-Language Summary

The role-separated account blocker is still open because the project has not proven real separated runtime behavior for
all required roles.

This package does not ask for permission to create accounts or handle passwords. It asks for permission to make a formal
row-by-row decision about what evidence is required next:

- collect stronger seeded local account/runtime evidence;
- accept fixture-only or variance evidence for a specific role;
- exclude a specific role from MVP;
- or keep the role blocked.

No role is excluded unless laozhuang explicitly says so.

## What Approval Of This Package Allows

If laozhuang approves `ROLE_SEPARATED_SEEDED_LOCAL_OR_OWNER_EXCLUSION_SCOPE_2026_06_23`, the next task may create a
docs/state decision record that assigns each mandatory role row to one of these outcomes:

- `seeded_local_runtime_required`;
- `fixture_only_or_variance_accepted_by_owner`;
- `mvp_excluded_by_owner`;
- `keep_blocked`.

The next task may also define the follow-up task list implied by those decisions.

## What This Package Does Not Allow

Approval of this package does not allow Codex to:

- create, disable, reset, or modify any account;
- read a password document;
- enter credentials on behalf of laozhuang;
- inspect or record passwords, tokens, cookies, localStorage, `.env*`, database URLs, or secrets;
- run seed scripts or write to a database;
- change schema, migrations, package files, lockfiles, source code, or e2e files;
- run new browser walkthroughs or Playwright specs;
- call Provider/model services;
- run Cost Calibration;
- deploy staging/prod/cloud resources;
- touch payment or external services;
- claim Standard MVP or Advanced MVP final Pass.

## Recommended Default Decision

The conservative default is to require seeded local account/runtime evidence for all eight mandatory rows unless
laozhuang explicitly accepts a variance or excludes a role from MVP.

This is the most credible path because the current gap is runtime role separation, not just fixture contract coverage.

## Role-by-Role Approval Matrix

| Role row                    | Plain-language meaning                 | Current status  | Recommended default             | Owner alternatives                                        | Why this row matters                                                                                                   |
| --------------------------- | -------------------------------------- | --------------- | ------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | Individual standard-edition learner    | partial_blocked | `seeded_local_runtime_required` | Accept current learner variance, or keep blocked.         | Current runtime session shows both standard and advanced labels, so it is not clean standard-only proof.               |
| `personal_advanced_student` | Individual advanced-edition learner    | partial_blocked | `seeded_local_runtime_required` | Accept fixture-only/variance evidence, or keep blocked.   | Advanced MVP needs proof that advanced learner behavior works without granting unrelated admin power.                  |
| `org_standard_employee`     | Standard-edition organization employee | blocked         | `seeded_local_runtime_required` | Exclude from MVP, accept fixture-only evidence, or block. | Employee access is different from personal learner access and needs allowed employee behavior plus denied admin power. |
| `org_advanced_employee`     | Advanced-edition organization employee | blocked         | `seeded_local_runtime_required` | Exclude from MVP, accept fixture-only evidence, or block. | Advanced enterprise behavior needs proof under employee scope, not just authorization fixtures.                        |
| `org_standard_admin`        | Standard organization administrator    | blocked         | `seeded_local_runtime_required` | Exclude from MVP, accept fixture-only evidence, or block. | Organization admin must be able to manage its organization without crossing boundaries or becoming system admin.       |
| `org_advanced_admin`        | Advanced organization administrator    | blocked         | `seeded_local_runtime_required` | Exclude from MVP, accept fixture-only evidence, or block. | Advanced organization admin must prove advanced entitlement and organization boundary behavior together.               |
| `content_admin`             | Content operations user                | blocked         | `seeded_local_runtime_required` | Accept fixture-only evidence, defer/exclude, or block.    | Current evidence only proves learner denial, not positive content operations workflow.                                 |
| `ops_admin`                 | System operations user                 | blocked         | `seeded_local_runtime_required` | Accept fixture-only evidence, defer/exclude, or block.    | Current evidence only proves learner denial, not positive system operations workflow.                                  |

## Suggested Owner Decision Options

### Option A: Strict Runtime Evidence For All Mandatory Rows

Approve all eight mandatory rows as `seeded_local_runtime_required`.

This is the strongest and most credible acceptance path. It keeps the blocker open until each role has a safe local
runtime walkthrough with both allowed and denied behavior.

### Option B: Mixed Runtime And Explicit Variance

Approve seeded runtime evidence for the roles that matter most to this MVP, and explicitly accept fixture-only or
variance evidence for lower-risk internal roles.

This can reduce work, but every variance must be named by role and recorded as an owner decision.

### Option C: Explicit MVP Exclusions

Exclude specific roles from MVP. This is acceptable only if laozhuang is comfortable saying those roles are not part of
the current Standard/Advanced MVP acceptance scope.

Excluded roles must be listed by exact role row. They cannot be silently inferred.

### Option D: Keep Blocked

Keep one or more rows blocked while the project continues other approved non-conflicting work. The overall
role-separated account gate remains Blocked.

## Recommended Next Task If Approved

Next task:

`acceptance-role-separated-account-seeded-local-or-owner-exclusion-decision-2026-06-23`

That task should record laozhuang's row-by-row decision only. Any later seeded local account implementation,
credentialed runtime walkthrough, seed script, account fixture, database write, or browser execution still needs a
separate fresh approval package.

## Redaction And Evidence Rules For Later Tasks

Any later task must record only:

- role row names;
- route/workflow labels;
- pass/fail/blocked status;
- high-level allowed and denied behavior summaries;
- command names and redacted outcomes.

Any later task must not record:

- passwords;
- credential document contents;
- tokens, cookies, localStorage, Authorization headers, or session values;
- `.env*` content;
- database URLs or raw database rows;
- raw prompts, raw generated AI content, provider payloads, raw answers, full question text, full paper text, or private
  user answer text.

## Approval Phrase

To approve the next docs/state decision task, laozhuang should explicitly say:

`批准 ROLE_SEPARATED_SEEDED_LOCAL_OR_OWNER_EXCLUSION_SCOPE_2026_06_23`

That approval will still not authorize account creation, credential handling, database seed/write, new browser runtime,
Provider, Cost Calibration, staging/prod, or final acceptance Pass.
