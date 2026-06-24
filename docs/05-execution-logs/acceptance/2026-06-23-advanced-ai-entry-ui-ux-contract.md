# Advanced AI Entry UI/UX Acceptance Contract

**Date:** 2026-06-23
**Task id:** `acceptance-advanced-ai-entry-ui-ux-contract-2026-06-23`
**Status:** closed as a UI/UX contract artifact; not a runtime acceptance Pass.
**Owner:** laozhuang. Codex only assists with execution and evidence organization.

## Overall Acceptance Status

This document does not close the Standard MVP or Advanced MVP acceptance.

It only defines the UI/UX acceptance contract for advanced AI entries. The overall acceptance remains open until later
runtime, role, Provider, Cost Calibration, staging, evidence, and final decision gates are separately executed and
reviewed.

Current known open acceptance blockers include:

- advanced AI entries are not yet discoverable from natural learner and backend navigation;
- organization training must not rely on manual URL entry;
- backend role landing currently sends admin-like accounts to `/ops/users` by default;
- backend workspaces do not yet provide visible logout;
- separated role account coverage still needs runtime follow-up;
- Provider, Cost Calibration, and staging gates remain blocked until separately approved.

## Closeout Note

On 2026-06-24, the owner asked Codex to handle remaining unprocessed branches and keep the repository clean. This document
is therefore closed as a contract artifact for later repair planning. Closing this artifact does not mean the advanced AI
entries pass runtime acceptance, and it does not approve Provider, Cost Calibration, staging, production, payment, source
implementation, or final MVP Pass.

## Plain-Language Conclusion

Advanced AI generation is not accepted just because a hidden page or route exists. A real user must be able to log in, see the right entry in a natural place, click it, and understand whether they are using personal learning, organization learning, organization admin content, or platform content operations.

For this project, the entry names should be simple:

- Learner side uses `AI训练` as the visible entry.
- Inside `AI训练`, users must see at least two clear actions: `AI出题` and `AI组卷`.
- Organization employees must also be able to find `企业训练` without typing a URL.
- Backend side uses `AI出题与组卷` as the management entry, with page actions for `AI出题` and `AI组卷`.

Manual URL input does not pass acceptance.

## What This Contract Covers

This contract covers visible product entry, navigation, role landing, workspace separation, and logout expectations for advanced AI generation acceptance.

It does not implement code. It does not approve Provider calls, AI model execution, cost measurement, staging, production, database changes, or final acceptance Pass.

## Confirmed Business Scope

The following business decisions are already confirmed and are not open questions in this contract.

| User type                                                   | What they must be able to do                                | Where the output belongs                                  | Important boundary                                                                        |
| ----------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Personal advanced learner                                   | Use `AI出题` and `AI组卷`.                                  | Personal learning content owned by the learner.           | Must not directly enter formal platform `question` or `paper`.                            |
| Organization advanced employee                              | Use `AI出题` and `AI组卷` in organization learning context. | Employee learning content under the organization context. | Organization can see summary and quota/audit information, not raw personal AI content.    |
| Advanced organization admin                                 | Use `AI出题` and `AI组卷` for organization-owned content.   | Organization-managed drafts or training/content assets.   | Must not enter platform formal question bank or paper library by default.                 |
| Content admin                                               | Use `AI出题` and `AI组卷` for platform content operations.  | Isolated reviewable drafts or suggestions until adopted.  | Formal adoption requires governed review, validation, attribution, and audit logging.     |
| Standard personal learner or standard organization employee | No usable advanced AI generation capability.                | Not applicable.                                           | They may see upgrade guidance if product chooses, but cannot use the advanced AI actions. |

## UX Principles

1. A feature that users must rely on cannot be hidden behind a URL.
2. The learner side is Mobile-first. The entry must be visible on common phone screens after login.
3. The backend side is Desktop-first. Entries should live in the sidebar or a clear workspace landing page, not in scattered hidden links.
4. The product must separate personal learning, organization learning, organization admin, content admin, and ops admin contexts.
5. Frontend visibility is not a security boundary. Server-side authorization still decides whether an action is allowed.
6. Every backend workspace must have a visible logout action.
7. If an account has multiple backend roles, the user must see a clear workspace switcher instead of being silently sent to the wrong workspace.

## Learner Entry Contract

### Personal Advanced Learner

After a personal advanced learner logs in:

1. The learner lands on the normal learner home.
2. The first screen of the learner home must show a visible `AI训练` entry.
3. The bottom navigation may also include `AI训练`; if it does not, the home entry must still be obvious without manual URL entry.
4. Clicking `AI训练` opens a learner AI page.
5. The learner AI page must show two primary actions:
   - `AI出题`
   - `AI组卷`
6. The page must make clear that the current context is personal learning.
7. Generated output stays in personal learning content. It is not formal platform content.

Fail examples:

- The user must type `/ai-generation`.
- The entry is only in profile settings.
- The page says only `发起本地 AI 请求` and does not clearly expose `AI出题` and `AI组卷`.
- A standard learner can click an enabled advanced AI action.

### Organization Advanced Employee

After an organization advanced employee logs in:

1. The learner home must show a visible `AI训练` entry.
2. The learner home must also show a visible `企业训练` entry when the employee has organization training access.
3. `AI训练` must offer `AI出题` and `AI组卷`.
4. The page must make clear whether the employee is using personal context or organization context.
5. If the same user has both personal advanced and organization advanced authorization, the product must require an explicit context choice before consuming organization quota.
6. Employee AI output stays in the learner's organization learning context. The organization can receive aggregate usage, quota, and redacted audit summaries, not raw learner AI content.

Fail examples:

- The employee must type `/organization-training`.
- The employee must type `/ai-generation`.
- The UI silently switches from personal to organization context just to get higher entitlement or quota.
- The organization admin can view raw employee AI prompts or generated content without a separately approved policy.

### Standard Learners

Standard personal learners and standard organization employees do not have advanced AI generation as an enabled capability.

Acceptable behavior:

- Hide `AI训练`, or show it as an upgrade/contact entry.
- If shown, `AI出题` and `AI组卷` must be disabled or blocked with clear upgrade guidance.

Unacceptable behavior:

- A standard learner can start `AI出题` or `AI组卷`.
- A standard learner sees an advanced action that appears enabled but fails only after a hidden server error.

## Organization Admin Backend Contract

Organization admins must not feel like they have landed in the global system operations backend unless they also have that role.

After an advanced organization admin logs in:

1. The user should land in an organization admin workspace, not `/ops/users`.
2. The workspace should identify itself as organization or enterprise management.
3. The sidebar or workspace landing page must expose:
   - `企业训练`
   - `AI出题与组卷`
   - organization analytics or employee summary where applicable
4. `AI出题与组卷` must expose page actions:
   - `AI出题`
   - `AI组卷`
5. Generated output belongs to the organization and follows organization draft, review, publish, version, and takedown boundaries.
6. It must not enter the platform formal question bank or paper library without a separate governed adoption path.
7. The backend top bar must include a visible logout action.

Fail examples:

- Advanced organization admin logs in and is sent straight to `/ops/users`.
- Organization training exists only at `/content/organization-training` and is absent from navigation.
- AI generation exists only as an unlinked route.
- There is no logout button in the backend shell.

## Content Admin Backend Contract

After a content admin logs in:

1. The user should land in the content backend, not the system operations backend.
2. The content backend sidebar must expose `AI出题与组卷` near question and paper management.
3. The `AI出题与组卷` page must show two primary actions:
   - `AI出题`
   - `AI组卷`
4. AI output first lands in an isolated review/draft surface.
5. Adoption into formal `question` or `paper` must require human review and existing content validation.
6. The adoption process must preserve reviewer attribution, source attribution, validation status, and `audit_log`.
7. The backend top bar must include a visible logout action.

Fail examples:

- A content admin logs in and is sent to `/ops/users` first.
- The content admin must manually choose `内容后台` after being sent to the wrong workspace.
- AI output can directly create or publish formal `question` or `paper`.
- There is no visible logout button.

## Ops Admin Backend Contract

Ops admin is not the same as content admin.

After an ops admin logs in:

1. It is acceptable to land in an ops workspace.
2. Ops may see user, organization, authorization, resources, and redacted AI audit/log summaries.
3. Ops should not receive content authoring AI generation as a default content workflow.
4. If an account has both ops and content roles, the UI must show a clear workspace switcher.
5. The backend top bar must include a visible logout action.

## Role Acceptance Matrix

| Role or account state                                                       | Expected visible entry after login                                      | Expected enabled AI action                                                | Must not happen                                                     |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `personal_standard_student`                                                 | Normal learner home; optional upgrade/contact hint.                     | No enabled `AI出题` or `AI组卷`.                                          | Usable advanced AI action.                                          |
| `personal_advanced_student`                                                 | Learner home first screen shows `AI训练`.                               | `AI出题` and `AI组卷` in personal context.                                | URL-only access or unclear local-test wording.                      |
| `org_standard_employee`                                                     | Learner home shows standard learning and `企业训练` if assigned.        | No enabled advanced AI generation.                                        | Enterprise AI generation enabled through standard `org_auth`.       |
| `org_advanced_employee`                                                     | Learner home shows `AI训练` and `企业训练`.                             | `AI出题` and `AI组卷` in organization context or explicit chosen context. | Manual URL entry or silent context switching.                       |
| Learner with both personal advanced and organization advanced authorization | Learner home shows `AI训练`; AI page shows context choice.              | Enabled action only after context is clear.                               | Consuming organization quota without explicit context.              |
| `org_standard_admin`                                                        | Organization workspace where standard organization functions are clear. | No enabled organization AI generation.                                    | Landing in system ops backend as if it were normal.                 |
| `org_advanced_admin`                                                        | Organization workspace with `企业训练` and `AI出题与组卷`.              | Organization-owned `AI出题` and `AI组卷`.                                 | Output entering platform formal library by default.                 |
| `content_admin`                                                             | Content backend with `AI出题与组卷`.                                    | Draft/review-only AI question and paper generation.                       | Landing in ops first; direct formal publish from AI output.         |
| `ops_admin`                                                                 | Ops backend with audit/log and operations entries.                      | No content-authoring AI generation by default.                            | Content editing/generation mixed into ops without workspace switch. |
| Multi-role backend account                                                  | Clear workspace switcher.                                               | Actions follow selected workspace and server authorization.               | Silent redirect to `/ops/users` as the only default.                |

## Current Static Findings

This contract is grounded in the current codebase state on commit `6897ee2d4be167298e50dfab761041a04d368d49`.

| Area                           | Current evidence                                                                                                                                    | Acceptance impact                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Learner AI route               | `src/app/(student)/ai-generation/page.tsx` exists and renders `StudentPersonalAiGenerationPage`.                                                    | Route exists, but route existence does not prove discoverable entry.                                         |
| Learner home                   | `StudentHomePage` exposes learner home actions such as profile, redeem code, mistake book, and exam report; no clear `AI训练` home entry was found. | Personal advanced and organization advanced learner AI entry is not accepted yet.                            |
| Learner bottom navigation      | `StudentAppLayout` has home, mistake book, and profile tabs only.                                                                                   | No persistent AI entry. Home must compensate, or a future implementation can add a tab.                      |
| Personal AI page wording       | `StudentPersonalAiGenerationPage` uses personal AI/local request wording and posts `aiFuncType: "explanation"` in the current local contract path.  | It is not yet a product-clear `AI出题` and `AI组卷` surface.                                                 |
| Organization employee training | `src/app/(student)/organization-training/page.tsx` and related tests exist.                                                                         | Direct route works in tests, but a visible learner entry is still required.                                  |
| Organization admin portal      | `AdminOrganizationPortalPage` links to organization training and analytics.                                                                         | Useful shell exists, but it is not in `AdminDashboardLayout` sidebar and login does not route there by role. |
| Content backend sidebar        | `AdminDashboardLayout` content menu has paper, question, material, and knowledge node entries.                                                      | No `AI出题与组卷` entry and no organization training/portal sidebar entry.                                   |
| Ops backend sidebar            | `AdminDashboardLayout` ops menu has AI audit logs, users, organizations, redeem codes, resources, and contact config.                               | Ops audit/log exists, but it is not content AI generation.                                                   |
| Login routing                  | `createPostLoginSessionBoundary` redirects any admin-like account to `/ops/users`.                                                                  | Content admin and organization admin landing is wrong for acceptance.                                        |
| Backend logout                 | `AdminDashboardLayout` has no visible logout action.                                                                                                | Backend shell fails logout expectation.                                                                      |
| Learner logout                 | Student profile has a logout control.                                                                                                               | Learner logout exists in profile, but this does not solve backend logout.                                    |

## Acceptance Checks For Future Implementation

A later implementation task should be judged against these checks.

### Learner Checks

- Personal advanced learner logs in and sees `AI训练` without typing a URL.
- Personal advanced learner opens `AI训练` and sees `AI出题` and `AI组卷`.
- Organization advanced employee logs in and sees `AI训练` and `企业训练` without typing URLs.
- Organization advanced employee can choose or clearly see personal versus organization context before using AI.
- Standard learners cannot use advanced AI generation.
- Evidence records role, route reached through navigation, visible labels, and action state only. It must not record passwords, tokens, prompts, raw generated output, or private content.

### Backend Checks

- Content admin lands in content backend or gets an explicit workspace choice, not a silent `/ops/users` redirect.
- Content backend sidebar shows `AI出题与组卷`.
- Advanced organization admin lands in organization workspace or gets an explicit workspace choice.
- Organization workspace shows `企业训练` and `AI出题与组卷`.
- Ops admin remains separated from content-generation workflow unless a workspace switch is explicit.
- Backend top bar has a visible logout action in content, ops, and organization workspaces.

### AI Generation Governance Checks

- Learner output stays learner-owned and isolated from formal platform content.
- Organization admin output stays organization-owned and isolated from platform formal libraries.
- Content admin output stays reviewable until governed adoption.
- Formal `question` or `paper` adoption remains a separate process with validation and audit.
- No Provider/model call is implied by clicking the entry unless a separate Provider gate is approved.

## Product Design Skill Record

The following skills are relevant for this workstream and should be reused in later UI/UX tasks:

| Skill                                                            | Use                                                                                                  |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `product-design:index`                                           | Discover the appropriate Product Design workflow.                                                    |
| `product-design:get-context`                                     | Mandatory brief/context gate before visual design, redesign, prototype, or implementation direction. |
| `product-design:ideate`                                          | Later visual alternatives for learner home, AI page, and backend sidebar layouts, if needed.         |
| `product-design:image-to-code`                                   | Later implementation from an approved screenshot, mockup, Figma frame, or visual target.             |
| `build-web-apps:frontend-testing-debugging`                      | Later targeted frontend implementation and verification.                                             |
| `browser:control-in-app-browser` or approved Playwright workflow | Later owner walkthrough and runtime validation only after scope approval.                            |

This task used Product Design context discovery only. No prototype, Figma file, visual generation, code implementation, or browser runtime was executed.

## Recommended Implementation Sequence

1. Approve this UI/UX contract.
2. Implement login landing and backend logout first because they affect every backend role.
3. Implement learner home `AI训练` and `企业训练` discoverability.
4. Implement backend sidebar/workspace entries for organization admin and content admin.
5. Update focused unit tests for navigation, labels, and disabled/enabled states.
6. Run a scoped runtime walkthrough with separated local accounts after implementation.
7. Only after entry and role evidence is clean, decide Provider, Cost Calibration, staging, and production gates.

## Blocked Gates

This contract does not approve:

- source code or test changes;
- fixture or e2e changes;
- browser or Playwright runtime;
- dev server start;
- database seed/write or schema/migration;
- Provider/model calls, prompt/provider payload, model output persistence, env/secret access, or Cost Calibration;
- package or lockfile changes;
- staging, production, cloud deploy, payment, external service, PR, force push, or final acceptance Pass.
