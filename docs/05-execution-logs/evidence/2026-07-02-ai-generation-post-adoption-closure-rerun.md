# AI generation post adoption closure rerun evidence

## Scope

- Task id: `ai-generation-post-adoption-closure-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-adoption-closure-rerun`
- Evidence mode: role, route, status, count bucket, and failure-category summaries only.

## Runtime Evidence

- Local service availability:
  - `http://localhost:3000`: HTTP 200.
- Content admin / AI 出题:
  - Parameter labels and level options: pass, level options include 1-5.
  - Ordinary UI technical wording leak count: 0.
  - After one bounded localhost generation attempt: history draft summaries present, material-insufficient entries present, adoption enabled count 0, adoption disabled count 8, pending count 2.
  - Result: pass for no technical wording and no adoption of ungrounded items; still needs later verification when a newly grounded structured question result is produced.
- Content admin / AI 组卷:
  - Parameter labels and level options: pass, level options include 1-5.
  - Ordinary UI technical wording leak count: 0.
  - Initial history: material-sufficient count 3, material-insufficient count 13, adoption enabled count 1, adoption disabled count 6.
  - After one bounded localhost generation attempt: completed count 7, pending count 0, adoption enabled count 1, adoption disabled count 6.
  - Result: pass for grounded/ungrounded adoption separation on visible history; formal adoption was not clicked in this rerun.
- Organization advanced admin / portal:
  - Login landed on organization portal with advanced organization capability visible.
  - Result: previous standard-backend downgrade was not reproduced in this sample.
- Organization advanced admin / AI 出题:
  - Parameter labels and level options: pass, level options include 1-5.
  - Ordinary UI technical wording leak count: 0.
  - After one bounded localhost generation attempt: completed count 2, pending count 0, history draft summaries present, application action count 0.
  - Result: fail for application closure; generated draft history exists but there is no visible organization action to publish, add to training source, or enter practice.
- Organization advanced admin / AI 组卷:
  - Parameter labels and level options: pass, level options include 1-5.
  - Ordinary UI technical wording leak count: 0.
  - After one bounded localhost generation attempt: completed count 2, pending count 0, history draft summaries present, application action count 0.
  - Result: fail for application closure; generated draft history exists but no visible organization paper application path.
- Personal advanced student / AI training:
  - Ordinary UI technical wording leak count: 0.
  - AI 出题 attempt: material-insufficient count present, retry enabled count 1, start-practice enabled count 1; entering practice state succeeded without reading question content.
  - AI 组卷 attempt: material-insufficient count present, retry enabled count 1, start-practice enabled count 1, self-test action wording present.
  - Result: partial pass; learner-side inline practice can open, but mixed "资料不足 + 可开始练习" state needs product semantics review.
- Organization advanced employee / AI training:
  - Ordinary UI technical wording leak count: 0.
  - AI 出题 attempt: material-insufficient count present, retry enabled count 1, start-practice enabled count 1; entering practice state succeeded without reading question content.
  - AI 组卷 attempt: material-insufficient count present, retry enabled count 1, start-practice enabled count 1, self-test action wording present.
  - Result: partial pass; learner-side inline practice can open, but mixed "资料不足 + 可开始练习" state needs product semantics review.
- Provider/runtime:
  - Bounded localhost UI generation attempts were made for content admin, organization advanced admin, personal advanced student, and organization advanced employee surfaces.
  - No Provider payload, prompt, raw input/output, generated content body, token detail beyond UI status, or credential value was recorded.

## Validation Evidence

- Pending closeout validation.

## Sensitive Evidence Check

- No credentials, cookie, token, localStorage, Authorization header, `.env*` content, DB raw row, internal numeric id, PII, Provider payload, prompt, raw AI output, raw DOM, screenshot, trace, full generated question, full generated paper, material, resource, or chunk content is recorded here.
