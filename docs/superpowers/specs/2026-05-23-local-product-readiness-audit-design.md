# Local Product Readiness Audit Design

## Purpose

Before continuing Phase 11 staging work, Tiku needs a systematic local product readiness audit. The audit prevents random manual discoveries from turning into ad hoc fixes and gives staging a clear entry decision.

This design is planning-only. It does not authorize code changes, cloud resources, deployment, staging/prod connections, secret/env changes, dependency changes, database schema changes, provider calls, or production resource changes.

## Recommended Approach

Use a staged audit track:

1. Define a role-play checklist and issue taxonomy.
2. Execute the checklist locally against `dev` with seeded accounts and local services.
3. Triage findings into staging blockers, staging known limitations, and backlog.
4. Create focused fix tasks only for the minimum set needed before staging.

This avoids mixing product stabilization with staging architecture planning while still protecting staging from becoming a demo of unknown half-finished surfaces.

## Audit Roles

- `student`: login, home, authorization visibility, practice, mock exam, exam report, mistake book, ai_explanation surfaces, redeem code, profile.
- `admin`: login, user management, organization management, org_auth, redeem_code management, resource operations, ai_call_log review.
- `content`: question, material, paper, knowledge_node, resource, knowledge_base, chunk, citation, evidence_status surfaces.
- `unauthenticated`: protected route access, login redirect, expired or missing session handling.
- `error-state`: empty data, disabled controls, failed API response, repeated submit, unauthorized action.

## Audit Matrix Shape

Each flow is recorded with:

- role;
- route;
- prerequisite data;
- action sequence;
- expected result;
- observed result;
- issue id when mismatched;
- severity;
- staging decision.

## Severity Rules

- `P0`: blocks login, role access, data safety, auth isolation, destructive action safety, or local app startup.
- `P1`: blocks a staging acceptance path that the owner is expected to try.
- `P2`: visible incomplete behavior that can be carried as a staging known limitation.
- `P3`: polish, copy, layout, or low-risk usability issue.

## Staging Entry Rules

Staging can proceed only when:

- all `P0` findings are fixed or explicitly downgraded with evidence;
- `P1` findings are either fixed or excluded from staging acceptance scope by human approval;
- `P2` findings are listed as known limitations;
- no evidence contains secrets, raw provider payloads, raw prompts, raw answers, or private real content;
- no staging/prod resource has been touched during the local audit.

## Evidence Rules

Allowed evidence:

- route paths;
- role names;
- short summarized UI behavior;
- HTTP status codes;
- redacted issue descriptions;
- file counts, public identifiers, and non-sensitive state summaries.

Forbidden evidence:

- `.env.local` contents;
- API keys, secrets, tokens, passwords beyond documented dev seed credentials;
- Authorization headers;
- raw provider payloads;
- raw prompts, raw answers, raw model responses;
- long real content excerpts, complete papers, OCR text, customer/customer-like private data.

## Initial Known Finding

- Issue id: `LPR-001`
- Route: `/content/questions`
- Role: `content` through admin account
- Summary: Some visible question/material action buttons are clickable but have no complete browser action.
- Current interpretation: API runtime has question/material create, update, disable, and copy endpoints, but the current UI has not wired all actions into forms, confirmations, toasts, and list refresh behavior.
- Severity: `P1` if content admin is included in staging acceptance; otherwise `P2` known limitation.
- Recommended handling: do not fix in this audit task. Carry into triage and decide whether it belongs in the pre-staging fix package.

## Follow-Up Task Shape

- `phase-11-local-product-readiness-roleplay-run`: execute the local audit checklist and record findings.
- `phase-11-staging-entry-fix-scope`: decide the minimum fix package before staging.
- Focused fix tasks: one task per bounded surface, for example content admin action wiring or student flow blockers.
