# 2026-07-06 AI Generation DB/Provider Next Decision Evidence

## Scope

- Task id: `ai-generation-db-provider-next-decision-2026-07-06`
- Branch: `codex/ai-generation-db-provider-next-decision-2026-07-06`
- Mode: redacted decision package only.
- Purpose: decide the next independent approval-gated task between `DB-backed local runtime replay` and `Provider-enabled bounded smoke`.

## Redaction

This evidence records document paths, role labels, route/workflow labels, aggregate statuses, count categories, and decision categories only.

It does not record credentials, sessions, cookies, tokens, headers, env values, DB URLs, raw DB rows, internal ids, PII, Provider payloads, raw prompts, raw AI output, full question, answer text, full paper, material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, employee raw answers, or plaintext `redeem_code`.

## Read Gate Result

- `AGENTS.md`: read.
- `docs/04-agent-system/state/project-state.yaml`: read.
- `docs/04-agent-system/state/task-queue.yaml`: read.
- `docs/03-standards/code-taste-ten-commandments.md`: read.
- `docs/02-architecture/adr/*.md`: read.
- Requirements and traceability overlays through `2026-07-06-ai-generation-recontract-requirements-materialization.md`: read.
- Latest final rollup, Provider root-cause, Provider count-timeout, runtime residual, and role-matrix evidence: read.

## Current Evidence Basis

| Evidence source                                                        | Relevant finding                                                                                                                                                         | Decision impact                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `2026-07-06-ai-generation-final-local-goal-rollup-audit.md`            | source/unit pass; browser role entry/denial pass; DB-backed runtime not tested for the new plan-and-select mutation; Provider-enabled not tested after recontract.       | This is the controlling current baseline.                                                     |
| `2026-07-06-ai-generation-recontract-requirements-materialization.md`  | AI组卷 is now plan-only Provider output plus local selection from formal question sources. Older nested generated-question paper evidence cannot prove the new contract. | Old DB/Provider evidence cannot be reused as a pass claim for the new contract.               |
| `2026-07-06-provider-count-timeout-observability-audit.md`             | Provider-enabled count `1` path passed; default count `10` path failed after Provider execution with no structured preview.                                              | Provider smoke remains useful but nondeterministic and not a product-source proof by itself.  |
| `2026-07-06-provider-enabled-small-sample-failure-root-cause-audit.md` | A local content-admin default-count path reached Provider execution after sufficient grounding and credential availability, then failed in Provider execution.           | Provider execution should not be used as the first proof of the new product runtime contract. |
| `2026-07-06-ai-runtime-residual-decision-package.md`                   | Earlier local runtime/provider small sample evidence existed, but it predated or did not cover the final recontract chain.                                               | Treat as historical context, not current post-recontract acceptance.                          |

## Adversarial Findings

| Question                                                | Finding                                                                                                                      | Classification            |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Can we claim DB-backed runtime pass now?                | No. The final rollup explicitly marks DB-backed runtime as not tested for the new plan-and-select generation mutation.       | gap                       |
| Can we claim Provider-enabled pass now?                 | No. The final rollup does not test Provider-enabled after recontract; count-timeout evidence is partial and count-sensitive. | gap                       |
| Can older 0704 runtime evidence close the new contract? | No. The recontract changed AI组卷 semantics from generated paper content toward plan-and-select.                             | unsupported extrapolation |
| Should Provider smoke run before DB replay?             | Not as the default. It would mix product runtime uncertainty with external Provider variability.                             | sequencing risk           |
| Does either next task authorize Cost Calibration?       | No. Both are separate from cost, quota, performance, staging, prod, release, and production-usability claims.                | hard boundary             |

## Decision Matrix

| Criterion                                                             | DB-backed local runtime replay | Provider-enabled bounded smoke |
| --------------------------------------------------------------------- | ------------------------------ | ------------------------------ |
| Directly tests post-recontract product persistence/handoff            | strong                         | partial                        |
| Requires env/secret/Provider execution                                | no                             | yes                            |
| Susceptible to network/model latency variability                      | low                            | high                           |
| Can validate role/source/container boundaries without external output | yes                            | only partially                 |
| Answers current final-rollup DB gap                                   | yes                            | no                             |
| Answers Provider parsing/grounding gap                                | no                             | yes                            |
| Cost Calibration risk                                                 | must remain excluded           | must remain excluded           |
| Approval need                                                         | separate fresh approval        | separate fresh approval        |

## Recommended Next Task

Choose `DB-backed local runtime replay` first.

Minimum approval wording should explicitly allow:

- localhost and local DB runtime only;
- non-destructive product actions only;
- credential-backed role walkthrough using private fixtures without recording fixture values;
- redacted evidence with aggregate statuses, role labels, workflow stages, count categories, and safe error categories.

Minimum scope:

- `personal_advanced_student`: AI出题 and AI组卷 through learning-session handoff;
- `org_advanced_employee`: AI出题 and AI组卷 through employee learning-session handoff;
- `org_advanced_admin`: AI出题 to training draft and AI组卷 to training paper draft;
- `content_admin`: AI出题 to reviewable question draft and AI组卷 to reviewable paper draft;
- optional standard-role denial spot check if included in approval.

Stop if:

- approved local DB target is unavailable;
- destructive DB or schema/seed/migration work would be required;
- sensitive fixture or raw DB/provider evidence would be needed;
- a source defect is confirmed, in which case open a separate fix branch.

## Deferred Task

Run `Provider-enabled bounded smoke` only after DB-backed runtime replay passes or the owner explicitly waives that prerequisite.

Minimum approval wording should explicitly allow:

- local-only Provider-enabled smoke;
- bounded attempts with stop-on-first unsafe or infrastructure failure behavior;
- redacted recording of grounding status, structured-preview parse status, requested/recognized count categories, safe failure category, and duration bucket.

It must not allow:

- Cost Calibration;
- cost, quota, latency, model quality, release, production, staging, prod, or deploy claims;
- raw Provider payload, raw prompt, raw AI output, full generated content, DB rows, internal ids, credentials, sessions, cookies, tokens, or env values.

## Classification

| Dimension                     | Classification                                        |
| ----------------------------- | ----------------------------------------------------- |
| source/unit                   | not executed in this task; latest rollup remains pass |
| DB-backed runtime             | not tested; recommended next                          |
| browser                       | not tested in this task                               |
| Provider-disabled             | not tested in this task                               |
| Provider-enabled small sample | not tested; deferred pending separate approval        |
| release readiness             | not claimed                                           |
| production usability          | not claimed                                           |
| staging                       | not executed / requires fresh approval                |
| Cost Calibration              | not executed / requires fresh approval                |

## Validation

| Command                                                                                             | Result |
| --------------------------------------------------------------------------------------------------- | ------ |
| `npm.cmd exec -- prettier --write --ignore-unknown <scoped docs/state files>`                       | pass   |
| `git diff --check`                                                                                  | pass   |
| `npm.cmd exec -- prettier --check --ignore-unknown <scoped docs/state files>`                       | pass   |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-db-provider-next-decision-2026-07-06` | pass   |

Runtime, DB, Provider, browser, staging/prod, deploy, env/secret, and Cost Calibration commands executed: false.
