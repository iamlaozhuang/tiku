# Phase 36 Doc Encoding Risky Case Review

## Scope

- Task id: `phase-36-doc-encoding-risky-case-review`
- Task kind: docs-only governance review
- Dependency: `phase-35-doc-encoding-safe-repair`

## Review Rule

Risky cases must not be repaired automatically when:

- the source encoding cannot be confirmed;
- the expected original Chinese text cannot be reconstructed with evidence;
- the file is outside `docs/`;
- the file is runtime data, upload data, generated data, or user-provided content;
- the repair could change requirement meaning, authorization boundaries, or evidence interpretation.

## Risk Register

| Path                                                                                                                 | Classification                       | Required next action                          |
| -------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| `.runtime/uploads/dev/resource/marketing/202605/9733b484c2cf192d97050434f5df6c23cd3302ac47dfeea44319c7f53ef66762.md` | out-of-scope runtime upload artifact | separate approval before inspection or repair |

## Non-Goals

- No content reconstruction.
- No file move or deletion.
- No runtime artifact repair.
- No provider/env/secret/staging/prod/cloud/deploy/payment/external-service action.
