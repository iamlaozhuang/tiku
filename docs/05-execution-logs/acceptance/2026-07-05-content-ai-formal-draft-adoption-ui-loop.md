# Content AI Formal Draft Adoption UI Loop Acceptance

Task id: `content-ai-formal-draft-adoption-ui-loop-2026-07-05`

## Acceptance Standards

- Content-admin current-session AI出题 adoption submits `reviewedDraft` to `/api/v1/content-ai-generation-results/{publicId}/formal-adoptions`.
- Content-admin current-session AI组卷 adoption submits a paper `reviewedDraft` with companion question drafts.
- Adoption stays blocked or unavailable when no current structured draft payload is available.
- Organization AI continues to route to organization training draft copy only.
- Evidence remains redacted and no Provider, DB, schema, dependency, browser, staging/prod, release, final Pass, or Cost Calibration work is introduced.

## Result

Pass.

- Current-session content AI出题 adoption sends `reviewedDraft` and preserves weak-evidence confirmation when required.
- Current-session content AI组卷 adoption sends a reviewed paper draft payload with companion question drafts.
- History-only redacted summaries keep adoption unavailable because the UI cannot reconstruct reviewed formal draft payloads from history.
- Organization AI generation remains on the organization training draft path.
