# Full-role UI/UX local design board materialization

Date: 2026-07-07

## Scope

This task materializes the full-role UI/UX remediation baseline into a repository-external local design board.

The design board is static and redacted. It is a planning and decision artifact, not an implementation. It does not change
code, accounts, fixtures, DB content, Provider behavior, packages, env files, schema, migrations, seed files, deployment
state, release readiness, production usability, staging, or Cost Calibration.

## Output Location

Repository-external output directory:

- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux`

Generated files:

- `index.html`
- `page-matrix.html`
- `README.md`
- `manifest.redacted.json`

## Source Alignment

The board is grounded in:

- the six batch baselines from 2026-07-07;
- the private 68-page screenshot inventory and 9 contact sheets;
- admin and student shell source entry files;
- design tokens and current layout primitives;
- Product Design audit lenses for information architecture, hierarchy, copy, interaction, and accessibility risk.

The board does not embed original screenshots. The page matrix records only role/page labels derived from screenshot file
names and safe design recommendations.

## Board Structure

### 1. Overview

Shows the locked design brief and evidence counts:

- 9 role or role-group lanes;
- 68 page screenshots;
- 6 baseline batches.

### 2. Global Page Skeleton

Turns the batch 0 rules into a visible structure:

1. role/workspace context;
2. status summary;
3. work area;
4. evidence or state area.

### 3. Backend Workspace Cards

Covers:

- operations summary-first workbench;
- organization context and edition boundary;
- content lifecycle and draft/review/publish closure.

### 4. AI Five-Zone Model

Shows:

1. context;
2. mode;
3. parameters;
4. boundary;
5. result/history.

The board preserves the current `AI组卷` contract: plan generation plus local selection, then a reviewable draft.

### 5. Learner Desktop-Readable Direction

Shows mobile-first continuity while clarifying the desktop target:

- mobile keeps single-column and bottom navigation;
- desktop widens content and constrains navigation;
- learner context appears before work areas.

### 6. Content Lifecycle

Shows state vocabulary for content and resource flows:

- draft;
- pending review;
- ready to adopt;
- published;
- retrieval-ready.

### 7. Implementation Slicing

Shows the recommended first implementation slices:

1. shared state templates;
2. learner shell;
3. organization training and AI;
4. content lifecycle.

### 8. Sanitized 68-Page Matrix

`page-matrix.html` gives one card per screenshot file. Each card includes:

- role label;
- page label;
- primary design direction;
- sanitized screenshot filename.

It does not include screenshot pixels or private content.

## Redaction Boundary

The local board and committed docs contain no credentials, account values, session, cookie, token, environment values, DB
URL, raw DB rows, internal ids, Provider payload, raw prompt, raw AI output, plaintext `redeem_code`, private fixture
values, full question, full paper, full material, raw resource content, screenshot pixels, or raw DOM.

## Follow-Up Use

The design board should be used as a visual reference before opening implementation branches. It supports grouping
future work by pattern rather than by isolated page:

- shared state templates;
- backend summary/list/detail structure;
- learner desktop-readable shell;
- AI page five-zone structure;
- content lifecycle and resource/knowledge state machines.

## Explicit Non-Claims

- No code implementation.
- No confirmed current-code defect fixed.
- No new accounts, content, screenshots, browser actions, DB reads/writes, Provider calls, dependency changes, env
  changes, schema/migration/seed changes, staging/prod/deploy work, release readiness, production usability, or Cost
  Calibration.
