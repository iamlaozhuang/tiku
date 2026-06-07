# Phase 37 Doc Encoding Regression Review

## Scope

- Task id: `phase-37-doc-encoding-regression-review`
- Task kind: docs-only governance regression review
- Dependency: `phase-36-doc-encoding-risky-case-review`

## Review Targets

- Confirm the batch contains only allowed docs-only governance files.
- Confirm no product code or blocked file category changed.
- Confirm formatting and diff checks pass.
- Confirm no project documentation encoding repair was performed without evidence.
- Confirm Cost Calibration Gate remains blocked.

## Validation Commands

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check <changed-doc-files>`
- strict `docs/` scan for invalid UTF-8, BOM, mixed line endings, replacement characters, and high-confidence mojibake markers
- `git status --short --branch`
- `git diff --name-only`
