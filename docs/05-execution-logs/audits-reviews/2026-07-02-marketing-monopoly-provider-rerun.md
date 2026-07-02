# Marketing and monopoly Provider rerun audit review

## Task

- Task id: `marketing-monopoly-provider-rerun-2026-07-02`
- Branch: `codex/marketing-monopoly-provider-rerun`

## Adversarial Review Checklist

- Scope is limited to marketing and monopoly local resource-backed acceptance; logistics is excluded until material exists.
- Evidence must not contain credentials, `.env*` values, raw DB rows, internal ids, PII, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI input/output, or full generated/resource/question/paper/material/chunk content.
- Provider budget is capped at 8 submits, max one per role/function route, with zero retries.
- Standard personal, standard employee, standard organization admin, and ops admin must not consume Provider budget unless a legitimate scoped AI generation surface exists.
- Resource import execution must stay local-only and idempotent; no schema/migration/seed or destructive reset is allowed.
- Any new blocker must be recorded as a follow-up finding unless the user separately approves a repair task.
- No release readiness, final Pass, Cost Calibration, staging/prod/cloud/deploy, PR, force push, dependency, package, or lockfile action is allowed.

## Review Result

- Scope complied: no source/test/runtime code changes, no dependency/package/lockfile change, no schema/migration/seed change, no staging/prod/cloud/deploy, no Cost Calibration, no release readiness or final Pass claim.
- Redaction complied: evidence records only aggregate counts, role labels, route labels, workflow labels, status categories, duration buckets, and validation summaries.
- Provider budget complied: 8 attempts total, max one per role/function route, 0 retries.
- Logistics stayed excluded from import and Provider acceptance, but logistics remains visible in admin UI options; this is a follow-up product issue, not closed by this rerun.
- Marketing backend/admin AI出题 is now visibly exercised through real Provider with structured `10/10` question-set preview.
- Learner/employee advanced routes and monopoly AI组卷 still do not meet the full owner-preview closure expectation; the result is a bounded acceptance rerun with residual findings, not a release gate.

## Follow-Up Findings

- `MM-RERUN-01`: learner and employee advanced AI出题 / AI组卷 submissions accept but do not expose visible generated content in ordinary UI.
- `MM-RERUN-02`: monopoly AI组卷 remains insufficient or failed in both organization and content admin samples; runtime RAG coverage is only one monopoly runtime resource.
- `MM-RERUN-03`: logistics option should be hidden or disabled with a business message while logistics material is missing.
- `MM-RERUN-04`: current-result success should be visually separated from historical failure/insufficient markers to avoid operator confusion.
