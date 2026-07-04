# Full Chain Acceptance Materials Reuse And Gap Inventory

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: metadata inventory only.

## Local-Private Package

Local-private source:

`D:/tiku-local-private/owner-facing-fixtures/2026-06-28-rawfiles-curated`

This package is outside the repository and must remain outside the repository. This task records only metadata-level
inventory and gaps.

## Reusable Inventory

| Area                 | Existing package content                                                                     | Reuse decision                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Redaction policy     | `redaction-policy.md`                                                                        | Reuse as the evidence boundary for later full-chain execution.                      |
| Manifest             | `resource-pack-manifest.json`                                                                | Reuse for profession/level/material coverage metadata.                              |
| Materials            | 66 files across common, monopoly, marketing, logistics categories                            | Reuse for content upload, knowledge node, and AI context selection.                 |
| Papers               | 25 files under monopoly and marketing                                                        | Reuse for paper library, paper snapshot, and training source checks.                |
| Answer keys          | 21 files                                                                                     | Reuse locally for answer/analysis review; do not copy answer content into evidence. |
| Inventories          | 4 files including source inventory, coverage, copied source files, knowledge-node candidates | Reuse for coverage counts and knowledge-node candidate planning.                    |
| Employee import      | Template, field spec, standard sample, advanced sample                                       | Reuse template and field rules; samples are too small for full-chain requirement.   |
| Questions            | Question index and minimal synthetic CSV                                                     | Reuse as smoke seed only; not enough for full question-type coverage.               |
| Authorization matrix | Standard/advanced org and personal scope labels                                              | Reuse as starting selector matrix after correcting logistics source status.         |

## Observed Counts

| Category                           | Count or fact                                                                                               | Planning impact                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Top-level materials files          | 66                                                                                                          | Enough to prepare multi-profession source coverage metadata. |
| Top-level paper files              | 25                                                                                                          | Enough to choose formal paper and training source samples.   |
| Answer-key files                   | 21                                                                                                          | Enough for local review, but full answers stay private.      |
| Employee sample line count         | 3 lines each including header                                                                               | Not enough for more-than-5-employee scenarios.               |
| Minimal question import line count | 4 lines including header                                                                                    | Not enough for all supported question types.                 |
| Paper plan question sections       | single choice, multiple choice, case analysis                                                               | Does not cover all current `questionTypeValues`.             |
| Current schema question types      | `single_choice`, `multi_choice`, `true_false`, `fill_blank`, `short_answer`, `case_analysis`, `calculation` | Full-chain pack must add missing question-type fixtures.     |

## Gaps To Fill Outside Repo

| Gap                                    | Required owner action before execution                                                                           | Storage location                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Standard employee import size          | Create standard employee CSV with more than 5 fake local-only employees.                                         | `D:/tiku-local-private/.../employee-import/full-chain/`                      |
| Advanced employee import size          | Create advanced employee CSV with more than 5 fake local-only employees.                                         | `D:/tiku-local-private/.../employee-import/full-chain/`                      |
| Organization tree                      | Create multi-level organization tree data with active standard and advanced branches.                            | `D:/tiku-local-private/.../organization-tree/`                               |
| Full question-type coverage            | Add synthetic import files for all current question types.                                                       | `D:/tiku-local-private/.../questions/full-chain/`                            |
| AI supported question-type matrix      | Add AI出题/AI组卷 supported-type checklist and expected redacted outcomes.                                       | `D:/tiku-local-private/.../ai-generation/full-chain/`                        |
| Private card selector pack             | Prepare standard, advanced, and upgrade card selector labels and private plaintext handling instructions.        | `D:/tiku-local-private/.../redeem-code/full-chain/`                          |
| Learning workload plan                 | Prepare per-role practice/mock/training activity plan sufficient for analytics.                                  | `D:/tiku-local-private/.../learning-workloads/full-chain/`                   |
| Analytics minimum data                 | Define minimum employee count, submitted training count, practice/mock count, and expected aggregate visibility. | `D:/tiku-local-private/.../analytics/full-chain/`                            |
| Logistics source-status reconciliation | `authorization-matrix.yaml` says logistics no source, while manifest addendum lists logistics materials.         | Update local-private package or record explicit supersession in future prep. |

## Reuse Constraints

- Do not commit local-private files.
- Do not copy full materials, questions, papers, answers, prompts, Provider payloads, raw AI output, employee answers,
  phone, email, password, plaintext `redeem_code`, token, cookie, session, localStorage, Authorization header, raw DB
  rows, screenshots, DOM, or trace files into the repo.
- Repo evidence may include only file categories, counts, labels, selectors, status, and redacted failure categories.

## Non-Claims

This inventory does not validate file import success, DB readiness, content correctness, or runtime acceptance.
