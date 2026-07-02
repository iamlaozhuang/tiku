# AI generation post query wording Provider rerun audit review

## Review Scope

- Verify that the post-repair rerun covers all scoped roles and AI 出题 / AI组卷 workflows.
- Verify that the two cross-cutting owner issues are not missed:
  - resource-pack/RAG grounding and off-domain generation risk;
  - ordinary UI leakage of local contract, redaction, evidence, or internal governance wording.
- Verify that evidence remains redacted and does not include raw sensitive or generated content.

## Current Status

- Review result: completed with findings; source repair is required before further Provider samples.

## Findings

1. P1 grounding failure: content-admin AI出题 produced a successful request record with no citation evidence. This means the previous query wording repair is not sufficient by itself to prove resource-pack/RAG constrained generation.
2. P1 adoption closure failure: content-admin “采用草稿” is not yet a trustworthy generated-content adoption closure. The UI submits a constructed reviewed draft payload, so a successful adoption action can create or mark a draft without proving it came from the generated AI result.
3. P1 role application closure gap: personal generated results are learner-private and formal adoption is blocked; organization results are scoped organization-private, but organization training/use closure still requires a post-repair rerun.
4. P2 UI wording improvement held for scanned content-admin pages: ordinary visible UI no longer showed local contract/redaction/evidence technical wording in the scanned AI出题 / AI组卷 pages.
5. P2 parameter contract improvement held for scanned content-admin pages: level options are now 1 through 5.

## Stop Decision

Further live Provider samples were stopped after the content-admin P1 failures. Continuing role-by-role Provider execution before repairing grounding and adoption closure would increase cost without resolving the root cause.

## Next Repair Scope

- Enforce sufficient grounding before any successful Provider result can be persisted as succeeded.
- Bind content-admin adoption to parsed/generated result drafts, not a generic reviewed payload.
- Add focused tests proving AI出题 count/structure and AI组卷 paper_section/coverage drafts can be adopted only from parsed generated content.
- After repair, rerun content-admin first, then organization advanced admin/employee, personal advanced student, and standard denial roles.
