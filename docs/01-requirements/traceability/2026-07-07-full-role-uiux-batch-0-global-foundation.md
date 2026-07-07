# Full-role UI/UX batch 0 global foundation baseline

Date: 2026-07-07

## Scope

Batch 0 establishes shared UI/UX rules for the six-batch full-role remediation series. It does not prescribe page-by-page final redesigns; those are handled in batches 1-5.

Inputs include the 68 repository-external screenshots, 9 contact sheets, redacted manifest, existing all-role UI remediation baseline, advanced edition requirements, ADRs, UI code standards, design tokens, and current shell/layout source.

This is docs-only. It does not approve code, DB, Provider, env, dependency, schema, migration, seed, staging/prod/deploy, release readiness, production usability, or Cost Calibration work.

## Current Global Reading

The current product already has a workable separation between:

- backend shell: desktop-first sidebar, top bar, workspace switcher, and role-aware menu visibility;
- learner shell: mobile-first top bar, bottom tab navigation, and single-column learning flows;
- role boundary behavior: standard roles are generally denied or guided away from advanced surfaces;
- content closure: content AI and formal content pages already expose draft/review/publish concepts;
- operations exception: eligible operations views intentionally show plaintext `redeem_code`; this remains required product behavior.

The cross-role problem is not that the business boundary is absent. The problem is that the same boundary is expressed with inconsistent structure, density, terminology, and state templates across page families.

## Global Design Principles

### 1. Role Context Must Be Visible Before Page Content

Every workspace should make the current actor context immediately scannable:

| Surface              | Required context signal                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Operations backend   | Workspace name, current role family, current operational domain, and whether the page changes platform-wide records.         |
| Content backend      | Workspace name, content lifecycle stage, and whether the action touches formal drafts or isolated AI review candidates.      |
| Organization backend | Current organization context, standard/advanced status, scoped capability set, and whether the user can mutate or only view. |
| Learner              | Current learning context, authorization source, edition, and whether actions consume personal or organization-owned quota.   |

The context signal should be a compact header band or summary block, not repeated explanatory paragraphs inside every card.

### 2. Menu Names Should Follow Product Domains, Not Implementation Names

Use stable user-facing names:

| Domain                  | Preferred display   | Notes                                                                                                                     |
| ----------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Operations workspace    | `运营后台`          | Owns users, organizations, authorization, `redeem_code`, support, and redacted logs.                                      |
| Content workspace       | `内容后台`          | Owns formal content and content AI draft/review surfaces.                                                                 |
| Organization workspace  | `组织后台`          | Existing display can remain, but copy may say `企业授权` and `企业训练` when referring to business packages and training. |
| Learner AI              | `AI训练`            | Umbrella entry containing `AI出题` and `AI组卷`.                                                                          |
| Content/organization AI | `AI出题` / `AI组卷` | Keep the two modes explicit; do not hide the difference behind generic `智能生成`.                                        |
| Organization training   | `企业训练`          | User-facing label stays `企业训练`; internal term can remain `organization_training`.                                     |

Avoid mixing `企业后台`, `组织后台`, `企业管理`, and implementation terms on the same surface unless the copy distinguishes workspace, business entity, and data object.

### 3. Page Information Architecture Should Use Four Layers

All long pages should converge on the same four-layer structure:

1. Context: who/where/edition/scope.
2. Summary: current status, counts, risks, and next action.
3. Work area: filters, list, form, detail, or wizard.
4. Evidence/status: audit timeline, history, result, or safe explanation.

This prevents dense backend pages from becoming one uninterrupted column of filters, cards, tables, and warnings.

### 4. Backend Layout Density Should Be Dense But Sectioned

Backend pages are desktop-first and may remain information-dense, but density must be structured:

- One primary task per section.
- Filters should be visually tied to the list they filter.
- Long cards should default to summary-first, with detail expansion.
- Table/list pages should show a compact count/status summary before rows.
- Secondary explanations should be moved into inline help, status notes, or collapsed detail.
- Primary actions should be visible near the section they affect, not only at the top or bottom of a long page.

### 5. Learner Layout Is Mobile-First, Desktop-Readable

The learner shell may remain mobile-first, but desktop browser acceptance must not look like an undersized phone screen floating in empty space.

Global target:

- Mobile: keep single-column, large touch targets, bottom navigation.
- Tablet/desktop: use a constrained but wider content column, stable top context, and optional two-column summary/detail layout where it improves scanability.
- Replace decorative or emoji-style tab symbols with the same line-icon language used elsewhere when implementation begins.

### 6. State Templates Must Be Shared

Use shared state templates across roles and workspaces:

| State                         | Required copy shape                                                | Required action shape                                                                   |
| ----------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Loading                       | `正在加载{对象}` plus short context if needed                      | No destructive or duplicate action.                                                     |
| Empty                         | What is absent, why it may be absent, and where to start           | One primary next action or return path.                                                 |
| Error                         | What failed, safe retry guidance, and whether data may be stale    | Retry and return action; no raw diagnostic payload.                                     |
| Forbidden                     | Current role cannot access this workspace or capability            | Return to allowed workspace; no login wording unless actually unauthenticated.          |
| Standard unavailable          | Current edition is standard and this is advanced-only              | Explain current available scope, advanced-only capability, and operation/upgrade owner. |
| Missing organization context  | User is valid, but no selected/allowed organization context exists | Select organization, return to overview, or contact operations depending on role.       |
| Provider disabled/unavailable | AI execution cannot run in current mode                            | Explain that request cannot execute now; keep form safe and do not imply user fault.    |
| Quota blocked                 | Valid role but quota/scope prevents action                         | Show quota owner and allowed next step without exposing internal ids.                   |

The current `super_admin` organization workspace mismatch falls under “missing organization context” or “not allowed to enter organization context,” not “please log in,” if the admin session is valid.

### 7. Buttons Need Stable Hierarchy And Reasoned Disabled States

Button hierarchy:

| Level       | Use                                                  | Visual rule                                               |
| ----------- | ---------------------------------------------------- | --------------------------------------------------------- |
| Primary     | One main commit action per section                   | Brand green, clear verb-object label.                     |
| Secondary   | Safe navigation or setup action                      | Outline or muted surface.                                 |
| Tertiary    | Low-impact inline action                             | Text/button-link style.                                   |
| Destructive | Disable, revoke, takedown, discard                   | Error semantic color, confirmation required.              |
| Disabled    | Capability blocked, incomplete input, or safe gating | Always pair with visible reason nearby or in helper text. |

Avoid multiple green buttons competing in the same viewport. Avoid disabled buttons with no explanation.

### 8. Copy Should Be Short, Specific, And Role-Aware

Global copy rules:

- Start with the user situation, not system internals.
- Use role and edition labels consistently.
- Prefer “当前标准版暂不可用” over generic “无权访问” when the reason is edition.
- Prefer “需要选择组织上下文” over “请先登录后台” when session exists but organization context is missing.
- Do not expose raw identifiers, raw logs, raw content, prompts, Provider payloads, or connection details.
- For AI pages, always distinguish generated learning content, organization training draft, and content review draft.

### 9. AI Page Family Should Share A Five-Zone Structure

All AI pages should converge on:

1. Context: role, edition, selected auth or workspace.
2. Mode: `AI出题` versus `AI组卷`.
3. Parameters: compact form/wizard grouped by task.
4. Boundary note: what generated output can and cannot become.
5. Result/history: status, retry, review/copy/adopt path, and safe failure reason.

The wording must preserve the current AI组卷 contract: AI generates an assembly plan, then local selection uses allowed formal question sources.

### 10. Content Lifecycle Should Use The Same Status Vocabulary

For content pages and content AI:

| Stage                | Meaning                                                                 |
| -------------------- | ----------------------------------------------------------------------- |
| Draft                | Editable work-in-progress.                                              |
| Pending review       | Needs human review or validation before adoption/publish.               |
| Review failed        | Needs correction before proceeding.                                     |
| Ready to adopt       | Can create or update editable formal draft after explicit confirmation. |
| Published            | Formal content visible in allowed learning flows.                       |
| Takedown/unpublished | No new use; historical records remain where required.                   |

Do not mix content AI candidates with published formal `question` or `paper` records in the same visual bucket.

### 11. Operations Pages Need Operational Summaries Before Ledgers

Operations pages should prioritize:

- pending work;
- expiring authorization;
- blocked overlap or quota issues;
- failed import or failed action summary;
- audit timeline for the selected object.

Logs and long ledgers should remain available, but the first screen should help an operator decide what to do next.

### 12. Redaction Is A UI And Evidence Requirement

The product UI has a narrow eligible operations exception for plaintext `redeem_code`, but batch docs, screenshots in repo, logs, audit summaries, exports, and non-eligible views remain redacted.

Global UI copy should not invite users to paste or expose private data into AI fields unless the flow has a governed scope and later approval.

## Batch 0 Implementation Implications For Later Batches

| Later batch                      | Must apply from batch 0                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Batch 1 operations/super admin   | Workspace context, operational summary first, plaintext `redeem_code` exception preserved, super admin organization context state clarified. |
| Batch 2 organization admin       | Standard/advanced state templates, organization context signal, training/analytics/AI menu copy.                                             |
| Batch 3 organization employee    | Learner AI/training context, quota owner wording, desktop-readable learner shell.                                                            |
| Batch 4 personal students        | Standard unavailable template, AI训练 five-zone structure, desktop-readable learner shell.                                                   |
| Batch 5 content admin/cross-role | Content lifecycle vocabulary, content AI review/adoption zones, cross-role terminology cleanup.                                              |

## P1 Global Baseline Items

1. Create a shared “role/workspace context” pattern before page content.
2. Replace generic unauthenticated wording with context-specific forbidden, unavailable, or missing-context wording.
3. Define desktop-readable learner layout rules without breaking mobile-first behavior.
4. Reduce long-page overload through context, summary, work area, and evidence/status layers.
5. Standardize AI page structure and the AI出题/AI组卷 mode split.

## P2 Global Baseline Items

1. Standardize backend filters, summary cards, table/list density, and pagination copy.
2. Standardize content lifecycle status names across formal content and AI draft/review flows.
3. Standardize button hierarchy, disabled-state explanations, and destructive confirmations.
4. Standardize standard/advanced denial copy and upgrade owner guidance.
5. Standardize safe error wording that never exposes raw diagnostics.

## Explicit Non-Claims

- No code implementation.
- No current-code defect fixed.
- No new screenshots, accounts, content, DB writes, Provider calls, dependency changes, env changes, schema/migration/seed changes, deployment, staging/prod work, release readiness, production usability, or Cost Calibration.
