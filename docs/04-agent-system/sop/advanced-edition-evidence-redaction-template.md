# Advanced Edition Evidence Redaction Template

## Purpose

This SOP defines the evidence redaction template for advanced edition governance and future implementation tasks. Evidence must prove behavior without recording sensitive content.

## Required Evidence Shape

Every advanced edition task evidence should include:

- task id;
- branch;
- task kind;
- changed files;
- validation commands and summarized outputs;
- approval boundary;
- blocked-work statement;
- redaction statement;
- next task or handoff state.

## Allowed Evidence Values

Evidence may record:

- public task identifiers;
- public configuration keys;
- status values;
- counts;
- timestamps;
- role names;
- high-level failure categories;
- quota point summary;
- `evidence_status`;
- redacted `audit_log` and `ai_call_log` summaries;
- file paths changed by the task.

## Sensitive Field Denylist

Evidence must not record:

- prompt;
- AI raw input or output;
- provider payload;
- provider response body;
- secret;
- token;
- database URL;
- API key;
- Authorization header;
- password;
- cleartext `redeem_code`;
- employee subjective answer text;
- personal AI full generated content that should not be visible to organization admin or ordinary operations views;
- staging/prod endpoint credentials;
- payment account or external-service credential.

## Redacted Summary Patterns

Use these summary patterns instead of sensitive values:

| Sensitive Source           | Evidence Pattern                           |
| -------------------------- | ------------------------------------------ |
| prompt                     | `prompt: <redacted>`                       |
| provider payload           | `providerPayload: <redacted>`              |
| cleartext `redeem_code`    | `redeemCode: <redacted>`                   |
| secret or token            | `secret: <redacted>` / `token: <redacted>` |
| employee subjective answer | `answerText: <redacted>`                   |
| AI generated content       | `generatedContentSummary: <redacted>`      |
| database URL               | `databaseUrl: <redacted>`                  |

## `audit_log` Evidence

For `audit_log`, evidence may include:

- public object identifier;
- action type;
- actor role;
- timestamp;
- result status;
- redacted metadata keys;
- reason category.

Evidence must not include sensitive raw values or cleartext `redeem_code`.

## `ai_call_log` Evidence

For `ai_call_log`, evidence may include:

- public task identifier;
- `model_provider` public identifier;
- `model_config` public identifier;
- token count summary;
- quota point summary;
- retry count;
- failure category;
- `evidence_status`;
- redaction status.

Evidence must not include prompt, AI raw input/output, provider payload, secret, token, database URL, or cleartext `redeem_code`.

## Task Evidence Checklist

Before a task claims completion, confirm:

- no sensitive field from the denylist appears in evidence;
- `audit_log` and `ai_call_log` are represented only by redacted summaries;
- Cost Calibration Gate remains blocked when relevant;
- code-stage queue seeding remains paused unless explicitly approved later;
- validation commands are recorded with outputs;
- changed files match the task `allowedFiles`.

## Non-Goals

This SOP does not approve export features, sensitive raw content viewers, provider calls, env/secret work, staging/prod/cloud/deploy work, payment work, or external-service integration.
