# AI Generation Grounding Product UI Repair Audit Review

## Scope

- Review source repair for AI 出题 / AI 组卷 grounding, ordinary product UI wording, ops route guard, and paper quantity preview.

## Findings

- No blocking findings after focused validation.
- Residual risk: this task did not run browser runtime or real Provider calls by boundary. A later owner-preview rerun must verify the same behavior on localhost with role sessions and a small Qwen sample.

## Checklist

- Cross-role scan included learner/employee shared page, content admin page, organization admin page, ops route guard, personal Provider execution, admin Provider execution, shared preview parser, and owner-preview local RAG runtime.
- Root cause fixed at source rather than only at UI:
  - generation now requires sufficient local grounding evidence before Provider execution;
  - insufficient evidence blocks before credential/config access;
  - prompt construction is grounded by selected generation parameters and retrieved evidence.
- UI fix is product-facing:
  - ordinary AI generation pages no longer expose local-contract/redaction/content-visibility governance wording;
  - admin DTO fields are mapped to product labels before rendering.
- Regression coverage:
  - focused tests cover grounding blocked/sufficient paths, learner/admin submit payloads, ops organization route denial, UI wording, and paper quantity parsing.
- Boundary check:
  - no DB mutation/read of raw rows;
  - no real Provider call;
  - no `.env*` read or write;
  - no package/lock/schema/migration/seed/deploy/PR/force-push changes;
  - evidence remains summary-only and redacted.
