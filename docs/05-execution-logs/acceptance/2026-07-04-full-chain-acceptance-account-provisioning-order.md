# Full Chain Acceptance Account Provisioning Order

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: account preparation plan only.

## Account Domains

| Domain                  | Tables or concepts                                                                  | Roles or users                                                                          | Key rule                                                                |
| ----------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Admin domain            | `auth_user`, `auth_account`, `admin`, `admin_organization`                          | `super_admin`, `ops_admin`, `content_admin`, `org_standard_admin`, `org_advanced_admin` | Admin phones must not be reused by learner/employee accounts.           |
| Learner/employee domain | `auth_user`, `auth_account`, `user`, `student`, `employee`                          | personal users, personal students, organization employees                               | Existing learner accounts may be bound as employees inside this domain. |
| Authorization domain    | `redeem_code`, `personal_auth`, `org_auth`, `org_auth_organization`, `auth_upgrade` | personal and organization authorization                                                 | `effectiveEdition` is computed; do not overwrite source `edition`.      |

Prepared input means private data or templates available for the later run. Scenario-created output means the later
acceptance flow must create the row or state unless a separately approved shortcut narrows that proof.

## Provisioning Order

| Step | Actor owner                  | Prepared input                                      | Scenario-created output                             | Must happen after | Must happen before                       | Notes                                                               |
| ---- | ---------------------------- | --------------------------------------------------- | --------------------------------------------------- | ----------------- | ---------------------------------------- | ------------------------------------------------------------------- |
| A01  | Future isolated DB task      | DB label and run selector                           | Empty isolated DB target after approved migrations  | Approval          | Any account action                       | Proposed label: `tiku_full_chain_acceptance_20260704_001`.          |
| A02  | Future bootstrap task        | `super_admin` selector and static config selector   | Bootstrap `super_admin` and `contact_config` only   | A01               | A03                                      | May be pre-existing or seeded after fresh approval.                 |
| A03  | `super_admin`                | Private `ops_admin`, `content_admin` account input  | `ops_admin`, `content_admin` admin-domain accounts  | A02               | T2/T3 operations                         | Creation should be proven by scenario 1.                            |
| A04  | `content_admin`              | Content operator account from A03                   | Content upload/build actions                        | A03               | Content upload/build                     | No operations or org authorization ownership.                       |
| A05  | `ops_admin`                  | Organization tree input                             | Organization tree rows                              | A03               | Org auth/admin/employee                  | Multiple `org_tier` levels required.                                |
| A06  | `ops_admin`                  | Standard enterprise authorization package input     | Standard enterprise `org_auth` rows                 | A05               | Standard org admin and employees         | Multi-scope package expands into multiple rows.                     |
| A07  | `ops_admin`                  | Advanced enterprise authorization package input     | Advanced enterprise `org_auth` rows                 | A05               | Advanced org admin and employees         | Same expansion rule.                                                |
| A08  | `ops_admin` or `super_admin` | Private org admin account inputs                    | `org_standard_admin`, `org_advanced_admin` bindings | A05/A06/A07       | Org admin preflight                      | Bind through `admin_organization`.                                  |
| A09  | `ops_admin`                  | Standard employee import CSV, more than 5 rows      | Standard employees                                  | A05/A06           | Standard employee learning               | Import target organization node is selected before upload.          |
| A10  | `ops_admin`                  | Advanced employee import CSV, more than 5 rows      | Advanced employees                                  | A05/A07           | Advanced employee learning and analytics | Import target organization node is selected before upload.          |
| A11  | `ops_admin`                  | Card request labels for standard, advanced, upgrade | `redeem_code` rows for standard, advanced, upgrade  | A03               | Personal redemption                      | Plaintext values remain private.                                    |
| A12  | User registration flow       | No-auth personal user input                         | Registered no-auth personal user                    | Content baseline  | Standard card redemption                 | Used for contact and redeem checks.                                 |
| A13  | User redemption flow         | Standard card private value                         | Standard `personal_auth`                            | A11/A12           | Upgrade card redemption                  | `personal_standard_activation` creates standard auth.               |
| A14  | User redemption flow         | Upgrade card private value                          | Advanced effective auth via `auth_upgrade`          | A11/A13           | Advanced learner AI                      | `edition_upgrade` writes `auth_upgrade`, not a new `personal_auth`. |

## Employee Import Rules

Employee import must be target-node-first:

1. `ops_admin` selects an active organization node.
2. Import preview validates rows.
3. Rows contain only permitted identity/profile columns.
4. Inherited authorization scopes are computed outputs.
5. Quota or authorization failures block affected rows with redacted reasons.
6. Passwords, if generated, are shown only in a one-time distribution window and never committed to evidence.

Forbidden employee import columns:

- `profession`
- `level`
- `subject`
- `edition`
- `orgAuthId`
- `orgAuthScopePublicId`
- `internalId`
- employee-level authorization whitelist columns

## Enterprise Authorization Row Expansion

Current schema fact: `org_auth` has one `profession` and one `level` per row.

Therefore, a later provisioning task must expand a commercial package like:

- standard enterprise package: `monopoly level_4`, `monopoly level_5`, `marketing level_3`
- advanced enterprise package: `monopoly level_3`, `monopoly level_4`, `monopoly level_5`, `marketing level_3`,
  `logistics level_4`

into separate current-schema `org_auth` rows or a separately approved future atomic-scope table. The preparation package
does not approve a schema change.

## Stop Conditions

- Stop if any admin phone selector collides with learner/employee phone selectors.
- Stop if organization admin is created as a learner/employee `user` instead of admin-domain `admin`.
- Stop if employee import includes authorization fields.
- Stop if org admin is not bound to organization by an explicit selector.
- Stop if employee import is attempted before target organization and `org_auth` exist.
- Stop if upgrade card redemption is attempted before an active matching standard `personal_auth`.
- Stop if any role can see a surface outside its required boundary.
- Stop if `ops_admin`, `content_admin`, organization tree, `org_auth`, organization admins, employees, cards, personal
  users, content, learning, training, or analytics rows are pre-created when the later run is supposed to prove their
  creation through the scenario flow.
- Stop if `contact_config` is absent or ambiguous before ordinary user contact validation.

## Non-Claims

This document does not create accounts or authorize DB writes. It prepares the future provisioning sequence only.
