# 2026-07-06 Local Adversarial Acceptance Recheck Audit

- Task id: `local-adversarial-acceptance-recheck-2026-07-06`
- Mode: adversarial recheck, evidence first, local only.
- Redaction: no secrets, sessions, cookies, DB URLs, raw rows, internal ids, Provider payloads, raw prompts, raw AI outputs, DOM dumps, screenshots, or full content.

## Findings

1. Provider-enabled runtime is not freshly reproducible in this run.
   - Fresh personal AI出题 stopped at `insufficient_grounding_evidence` with no Provider call, no structured preview, and no materialized result.
   - Fresh content AI组卷 and organization AI出题 returned `409015`.
   - This contradicts any attempt to treat the latest Provider-pass baseline as a fresh current conclusion.

2. `personal_standard_student` is not independently reproducible from the current available 0704 fixture set.
   - The 0704 personal contact fixture is advanced-capable.
   - The older role-separated personal standard credential path returned `401002`.
   - Therefore browser matrix evidence is partial even though standard organization roles deny correctly.

3. DB-backed runtime evidence is mixed.
   - Organization downstream training flow passed on current DB history: source context, publish, employee answer, and aggregate statistics all returned code `0`.
   - Content admin formal review endpoint returned code `0` and preserved direct-publish blocking, but reused an existing approved draft state instead of proving a fresh reject/adopt decision.
   - Learner learning-session flow could not start because fresh generated visible content was unavailable.

4. Source/unit and mechanism health are strong but do not imply runtime readiness.
   - Lint, typecheck, unit tests, and mechanism diagnostics passed.
   - These gates support source health only; they do not prove Provider, staging, prod, Cost Calibration, or release readiness.

5. Frontend error handling is not purely generic for the sampled blocked generation path.
   - The content admin AI paper browser probe showed the business code `409015` and a specific grounded-output message in the visible alert.
   - This supports partial Provider-disabled/no-generation UX confidence, not full Provider-disabled coverage.

## Risk Register

| Risk                                                                    | Status | Required follow-up                                                                                                                         |
| ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Current local grounding material unavailable or not resolved by runtime | open   | Recreate or point localhost to the expected local resource/RAG material, then rerun Provider small sample under fresh approval boundaries. |
| Personal standard fixture not available in current 0704 credential plan | open   | Materialize a current personal standard fixture or document why the old fixture is superseded.                                             |
| Content admin review path reused existing approved state                | open   | Use a fresh eligible generated result or a verified unreviewed current DB candidate for adopt/reject proof.                                |
| Learner generated-content-to-learning-session path blocked              | open   | Rerun after sufficient grounding creates visible generated content and a materialized result.                                              |

## Decision

Current local evidence is credible for source/unit health, mechanism health, standard organization denial, advanced role entry visibility, and selected downstream DB-backed organization training operations. It is not credible enough to claim fresh Provider-enabled AI generation, full learner AI training closure, full seven-role browser matrix closure, release readiness, production usability, staging, or Cost Calibration.
