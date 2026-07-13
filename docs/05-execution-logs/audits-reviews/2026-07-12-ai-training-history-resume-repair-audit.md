# AI Training History Resume Repair Audit

**Task:** `user-led-ai-training-history-resume-repair-2026-07-12`

## Audit Result

APPROVE pending Module Run v2 closeout and merge verification.

## First Adversarial Review: Authority and Data Integrity

- The production learning-session route receives a Postgres persisted-result repository. It no longer accepts browser-supplied paper assembly for the production paper path.
- Lookup first scopes to the current personal owner. An employee may additionally use only the current organization owner scope with the same actor; it cannot name another organization or actor.
- The persisted result must be a draft AI paper with sufficient evidence, citations, an assembled container, no insufficiency, and at least one selected question.
- Source resolution happens server-side against visible authoritative sources. It cannot create a partial session when a selected source is unavailable.
- Existing sessions return their immutable stored questions before source re-resolution. Collision checks still bind source result, task, owner, and actor.

## Second Adversarial Review: State, UX, and Regression

- Mode selection owns request and result history filters. Mode switch resets page/detail state and guards against a late earlier-mode response overwriting the selected mode.
- Cross-mode transient experience is not rendered as the wrong mode, while the original result remains available on return to its source mode.
- Provider-closed state keeps settings and history available but leaves generation controls unavailable. No Provider-enabled behavior was introduced.
- Historical AI paper action is limited to recoverable assembled snapshots. A legacy summary-only row does not synthesize questions from an untrusted client or stale source.
- The shared component preserves different personal versus enterprise title, authorization context, and source visibility behavior.
- Full unit, lint, typecheck, format, build, and diff checks passed. The repeated full test run cleared the one transient unrelated first-run operations UI failure.

## Residual Boundary

- Existing legacy AI paper rows that never stored an assembled result snapshot cannot be safely resumed. They remain readable only. Backfilling or creating an immutable snapshot for such rows would require a separate data-governance task and must not be improvised here.
- The temporary 390px browser attachment failed after viewport override. The viewport was reset and no product evidence was fabricated; shared UI tests passed. This does not replace a future successful mobile browser runtime check.

## Taste Compliance Checklist

- [x] Used existing contracts, repositories, services, tokens, and UI patterns; no dependency or design-token expansion.
- [x] Kept API envelopes, naming, ISO time conventions, and formal-write boundaries intact.
- [x] State ownership is reduced rather than duplicated: active mode drives both histories.
- [x] Server authority replaces browser-trusted paper assembly for persisted paper recovery.
- [x] Failure paths are explicit and fail closed; no unsafe legacy reconstruction or hidden Provider call.
- [x] Tests cover personal and organization employee boundaries, tampering, collisions, stale responses, refresh recovery, and changed source conditions.
- [x] No secret, credential, session, cookie, token, environment value, database URL, raw database row, or raw AI content enters versioned evidence.
