# 2026-07-06 AI出题 / AI组卷重定合同需求物化

## Status

- Type: requirement traceability overlay
- Trigger: product-owner discussion after local 0704 AI generation acceptance and Provider count-timeout audits
- Scope: AI出题 / AI组卷 product contract, role source boundary, UI/UX interaction, and follow-up implementation split
- Result: new requirement baseline materialized; implementation not started

This document is a requirements and traceability artifact only. It does not approve source code, tests, schema, migration,
database mutation, Provider execution, prompt changes, dependency changes, env/secret work, staging/prod/deploy, release
readiness, production usability, final Pass, or Cost Calibration.

## Source Order And Supersession Rule

Future AI出题 / AI组卷 work must read this file after the existing 2026-07-02 and 2026-07-05 AI generation baseline
documents:

1. `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
2. `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
3. `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
4. This 2026-07-06 recontract overlay

The 2026-07-02 and 2026-07-05 documents remain valid for role eligibility, standard/advanced boundaries, governance
separation, and closed-loop targets. This document narrows and changes the AI组卷 product semantics:

- older evidence that proves Provider can generate a `paper_draft` with nested generated question drafts remains valid
  historical runtime evidence;
- that evidence must not be used to claim the new AI组卷 contract is implemented;
- implementation tasks after this document must treat AI组卷 as "AI creates an assembly plan, local services select
  existing formal questions".

## Core Product Definitions

### AI出题

AI出题 means the AI service generates complete question draft content.

The generated draft may include:

- question stem;
- question type;
- options for objective questions;
- standard answer or reference answer;
- analysis;
- knowledge-node labels;
- difficulty;
- other structured draft fields needed by review or practice flows.

The generated result remains a draft or learner-training artifact. It is not a formal question and does not enter AI组卷
question sources unless a later governed formal process turns it into an eligible formal question.

### AI组卷

AI组卷 means the AI service generates a paper assembly plan, and the product locally assembles the paper from eligible
existing formal question sources.

The AI-generated plan may include:

- profession, level, and subject;
- target total question count;
- question-type distribution;
- knowledge coverage requirement;
- difficulty goal;
- paper-section structure;
- per-section selection constraints.

The AI-generated plan must not include:

- full question stems;
- options;
- standard answers;
- analysis;
- generated full question bodies used as final paper questions.

AI组卷 final questions must come from allowed question sources only.

## Confirmed Question Source Contract

### Platform Formal Question Bank

For the current model, platform formal question bank means platform `question` records with `status = available`.

### Enterprise Question Bank v1

Enterprise question bank v1 means question snapshots from the same organization's published and not taken-down
enterprise training versions.

It is intentionally not a separate standalone enterprise question-bank table in this contract. A later reviewed design
may introduce a true enterprise `question` resource model, but that is not required for v1.

### AI-Generated Draft Exclusion

AI-generated drafts are excluded from AI组卷 sources by default:

- personal learner AI-generated questions are not AI组卷 sources;
- employee AI-generated questions are not AI组卷 sources;
- organization-admin AI-generated questions are not AI组卷 sources unless they later become eligible enterprise
  question snapshots through a published training version;
- content-admin AI-generated questions are not AI组卷 sources unless they later become platform `question.status =
available` records through governed formal adoption.

## Role Contract

| Role                        | AI出题 product result                                                         | AI组卷 allowed sources                                                                      | AI组卷 product result                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `personal_advanced_student` | personal practice question drafts                                             | authorized platform formal question bank                                                    | self-test paper preview, then learning session after confirmation                                               |
| `org_advanced_employee`     | employee practice question drafts scoped to the selected organization context | authorized platform formal question bank plus same-organization enterprise question bank v1 | enterprise self-test paper preview, then employee learning session after confirmation                           |
| `org_advanced_admin`        | enterprise training question drafts                                           | authorized platform formal question bank plus same-organization enterprise question bank v1 | enterprise training paper draft that can be edited, previewed, saved, and published through enterprise training |
| `content_admin`             | reviewable content question drafts                                            | platform formal question bank                                                               | reviewable paper draft created directly into the governed content draft/review flow                             |

Standard roles remain denied, hidden, upgrade-guided, or unavailable for advanced AI generation:

- `personal_standard_student`;
- `org_standard_employee`;
- `org_standard_admin`.

UI visibility remains only discovery. Runtime services must enforce `effectiveEdition`, authorization scope, role,
organization context, and source boundary checks.

## Quantity Contract

| Capability | Default | Allowed maximum | Meaning                                                                 |
| ---------- | ------: | --------------: | ----------------------------------------------------------------------- |
| AI出题     |       3 |              10 | number of question drafts requested from AI                             |
| AI组卷     |      30 |              80 | target number of existing formal questions in the final assembled paper |

AI组卷 question count is not a Provider generation count for new questions. It is a local paper assembly target count.

## AI组卷 Flow Contract

1. User enters allowed AI组卷 surface.
2. User selects role-appropriate scope, paper target, and source preferences.
3. AI service creates a paper assembly plan only.
4. Local service resolves eligible question sources for the role and context.
5. Local service selects questions, removes duplicates, groups sections, and records match quality.
6. Local service creates the role-specific paper container.
7. User continues through preview, answer, edit, review, or publish flow depending on role.

Provider must not be asked to generate final full question content for AI组卷.

## Question Selection And Degradation Contract

AI组卷 must prefer exact matching but may degrade when sources are insufficient.

Recommended degradation order:

1. exact knowledge node, question type, difficulty, profession, level, and subject;
2. same parent knowledge node;
3. same profession, level, and subject;
4. if still insufficient, return a user-facing insufficiency state.

The system must not let AI invent missing questions during AI组卷.

User-facing results must explain match quality:

- fully matched;
- automatically supplemented from nearby knowledge nodes;
- automatically supplemented from same profession/level/subject;
- still insufficient and requires user adjustment.

User-facing text must not expose technical terms such as `fallback` or internal enum names.

## Knowledge Coverage UI Contract

AI组卷 knowledge coverage must not be a free-text-only field.

The UI should use structured selection first and optional free-text supplement second:

- coverage mode:
  - `均衡覆盖`;
  - `指定知识点`;
  - `薄弱知识点优先`;
  - `综合测验`;
- specified knowledge nodes:
  - knowledge tree or search multi-select;
  - limited to current authorization scope or content workspace scope;
  - no raw internal ids in UI;
- supplement:
  - optional plain Chinese requirement text;
  - soft constraint only;
  - never the only query key for formal question selection.

## Paper Container Contract

AI组卷 must create a paper container. It must not leave the user with a raw AI result only.

The container should include:

- paper name;
- profession, level, and subject;
- target question count and actual question count;
- expected duration when available;
- paper-section structure;
- question-type distribution;
- knowledge coverage;
- source composition;
- match quality;
- degradation explanation;
- next allowed actions.

| Role                        | Container label  | Primary next action                                                   |
| --------------------------- | ---------------- | --------------------------------------------------------------------- |
| `personal_advanced_student` | 自测试卷预览     | 开始作答                                                              |
| `org_advanced_employee`     | 企业自测试卷预览 | 开始作答                                                              |
| `org_advanced_admin`        | 企业训练试卷草稿 | 编辑试卷、调整题目、预览员工视角、保存草稿、发布训练                  |
| `content_admin`             | 待审试卷草稿     | 编辑、驳回、审核、发布正式试卷 through existing governed publish flow |

Learner and employee previews must not show answers or analysis before the user starts or completes the answer flow.

## UI/UX Contract

All user-visible AI出题 / AI组卷 UI must be Chinese and must use ordinary product language, not technical implementation
language.

Avoid these visible terms:

- `Provider`;
- `structuredPreview`;
- `payload`;
- `task`;
- `raw output`;
- `grounding`;
- `fallback`;
- `ownerType`;
- `source context`;
- `paper draft`.

Use Chinese product terms instead:

- `AI服务`;
- `预览结果`;
- `生成记录`;
- `生成内容`;
- `使用范围`;
- `草稿`;
- `题源说明`;
- `依据资料`;
- `匹配说明`;
- `自动补足`;
- `待审试卷草稿`.

### Learner And Employee AI训练 UI

The learner and employee surface should be an `AI训练` workbench with two tabs:

- `AI出题`;
- `AI组卷`.

Changing tabs must only change the form. It must not submit a generation request.

The submit button belongs at the bottom of the active form:

- AI出题: `生成练习题草稿`;
- AI组卷: `生成自测试卷` for personal learners;
- AI组卷: `生成企业自测试卷` for organization employees.

The UI must show the same quantity that will be sent to the backend. Hidden defaults are not acceptable.

Personal AI组卷 source label:

- `平台正式题库`.

Organization employee AI组卷 source label:

- `平台正式题库 + 本企业可用题库`.

Organization employee AI组卷 should include source preference:

- `均衡使用`;
- `优先使用企业题`;
- `优先使用平台题`.

Employee-generated learner AI content remains employee-owned by default and must not expose raw generated content to
organization admins.

### Organization Advanced Admin UI

The organization advanced admin surface should be an enterprise content workbench, not a learner self-practice page.

Suggested page label:

- `企业 AI 训练内容`.

Tabs:

- `AI出题`;
- `AI组卷`.

AI出题 form:

- applicable scope: profession, level, subject;
- knowledge nodes;
- question type;
- quantity: default 3, maximum 10;
- difficulty;
- training goal;
- submit label: `生成训练题草稿`.

AI出题 result:

- question draft list;
- edit, remove, and add-to-training-draft actions;
- visible product wording: `这些题目还未发布，员工暂时看不到。`

AI组卷 form:

- applicable scope: profession, level, subject;
- source range:
  - `平台正式题库`;
  - `本企业已发布训练题`;
- source preference:
  - `均衡使用`;
  - `优先使用企业题`;
  - `优先使用平台题`;
- quantity: default 30, maximum 80;
- knowledge coverage;
- question-type distribution;
- difficulty;
- training goal;
- submit label: `生成训练试卷草稿`.

AI组卷 result enters an enterprise training paper draft detail with:

- paper name, quantity, and duration;
- paper-section structure;
- knowledge coverage;
- source composition;
- match explanation;
- degradation explanation;
- question list with answers and analysis collapsed by default;
- actions: `编辑试卷`, `调整题目`, `预览员工视角`, `保存草稿`, `发布训练`.

### Content Admin UI

Suggested page label:

- `内容 AI 辅助`.

AI出题 submit label:

- `生成待审题目草稿`.

AI组卷 submit label:

- `生成待审试卷草稿`.

Content admin AI组卷 should directly create a reviewable paper draft container. It should not stop at a transient AI
result. The draft remains editable and must still pass the governed content review and publish flow.

The content AI组卷 source label:

- `平台正式题库`.

## Current Implementation Gap Reading

The implementation observed before this document has several expected gaps against the new contract:

- shared task spec and frontend defaults are not aligned with the new 3/30 quantity contract;
- learner AI组卷 currently has no visible target question-count control;
- learner UI has AI出题 / AI组卷 action buttons that can be mistaken for mode switches even though they submit;
- current Provider instruction for AI组卷 asks for `paperSections` with nested full generated questions;
- current structured preview parser accepts generated `questionDrafts` inside paper sections;
- content adoption currently maps AI-generated paper-section question drafts into formal draft companions rather than
  selecting existing platform formal questions;
- platform formal question selection has a reusable question repository basis, but there is no paper assembly resolver
  for this new contract;
- enterprise question bank v1 must resolve from published organization training question snapshots, not from a
  standalone enterprise question table.

These are requirement-to-implementation gaps, not defects to fix inside this documentation task.

## Follow-Up Implementation Packets

Implementation should be split. Do not bundle all changes into one source task.

1. AI组卷 backend plan-and-select service contract:
   - AI plan DTO;
   - platform question selector;
   - enterprise snapshot selector;
   - degradation and insufficiency categories;
   - paper container DTO.
2. Learner and employee AI训练 UI:
   - tabs instead of submit-mode buttons;
   - visible quantity controls;
   - source labels and source preference;
   - preview-before-answer flow.
3. Organization advanced admin AI training content UI:
   - enterprise content workbench;
   - AI出题 draft flow;
   - AI组卷 paper draft flow;
   - employee-view preview and publish actions.
4. Content admin AI auxiliary UI and paper draft adoption:
   - direct creation of reviewable paper draft container;
   - platform formal question selection only;
   - governed edit/reject/review/publish handoff.
5. Quantity and validation alignment:
   - default AI出题 3, max 10;
   - default AI组卷 30, max 80;
   - source insufficiency and degradation user messages.
6. Role matrix and local acceptance recheck:
   - standard role denial;
   - advanced role entries;
   - Provider-disabled clarity;
   - Provider-enabled only after separate bounded approval;
   - no Cost Calibration claim.

## Non-Claims

- The new AI组卷 contract is not implemented by this document.
- Existing local 0704 AI generation acceptance remains historical evidence only and is not a pass claim for the new
  plan-and-select AI组卷 contract.
- No Provider, DB-backed runtime, browser, staging, production, release-readiness, production-usability, final Pass, or
  Cost Calibration execution is approved or claimed.
- Evidence and future task output must remain redacted and must not record credentials, sessions, cookies, tokens, env
  values, DB connection values, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI output, full question,
  full paper, material content, resource content, chunk content, screenshots, DOM dumps, traces, private fixture values,
  employee raw answers, or plaintext `redeem_code`.
