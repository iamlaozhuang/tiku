import { describe, expect, it } from "vitest";

import {
  normalizeCredentialIssueInput,
  normalizeDistributionConfirmationInput,
  normalizeEmployeeImportCommandInput,
  normalizeIdempotencyKey,
} from "./employee-import-command";

const validBatchInput = {
  commandKind: "batch_import",
  organizationPublicId: "organization-public-001",
  rows: [
    {
      phone: "13900000001",
      name: "Employee One",
      initialPassword: "employee123",
    },
  ],
};

describe("normalizeIdempotencyKey", () => {
  it("accepts and canonicalizes a UUID v4 idempotency key", () => {
    expect(
      normalizeIdempotencyKey(" 00000000-0000-4000-8000-000000000001 "),
    ).toEqual({
      success: true,
      value: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("rejects a value that is not a UUID v4", () => {
    expect(normalizeIdempotencyKey("not-a-v4")).toEqual({
      success: false,
      message: "Idempotency-Key must be a UUID v4.",
    });
    expect(
      normalizeIdempotencyKey("00000000-0000-3000-8000-000000000001"),
    ).toEqual({
      success: false,
      message: "Idempotency-Key must be a UUID v4.",
    });
  });
});

describe("normalizeEmployeeImportCommandInput", () => {
  it("normalizes ordered rows and treats a null optional password as omitted", () => {
    expect(
      normalizeEmployeeImportCommandInput({
        commandKind: "single_create",
        organizationPublicId: " organization-public-001 ",
        rows: [
          {
            phone: " 13900000001 ",
            name: " Employee ",
            initialPassword: null,
          },
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        commandKind: "single_create",
        organizationPublicId: "organization-public-001",
        rows: [
          {
            rowNumber: 1,
            phone: "13900000001",
            name: "Employee",
            initialPassword: "",
          },
        ],
      },
    });
  });

  it("keeps malformed phone and password strings for row-level rejection", () => {
    expect(
      normalizeEmployeeImportCommandInput({
        ...validBatchInput,
        rows: [
          {
            phone: "invalid-phone",
            name: "Employee",
            initialPassword: "12345678",
          },
        ],
      }),
    ).toEqual({
      success: true,
      value: {
        commandKind: "batch_import",
        organizationPublicId: "organization-public-001",
        rows: [
          {
            rowNumber: 1,
            phone: "invalid-phone",
            name: "Employee",
            initialPassword: "12345678",
          },
        ],
      },
    });
  });

  it("accepts valid null-prototype command and row objects", () => {
    const nullPrototypeRow = Object.assign(Object.create(null), {
      phone: "13900000001",
      name: "Employee",
      initialPassword: null,
    });
    const nullPrototypeCommand = Object.assign(Object.create(null), {
      commandKind: "single_create",
      organizationPublicId: "organization-public-001",
      rows: [nullPrototypeRow],
    });

    expect(normalizeEmployeeImportCommandInput(nullPrototypeCommand)).toEqual({
      success: true,
      value: {
        commandKind: "single_create",
        organizationPublicId: "organization-public-001",
        rows: [
          {
            rowNumber: 1,
            phone: "13900000001",
            name: "Employee",
            initialPassword: "",
          },
        ],
      },
    });
  });

  it("ignores a polluted Object.prototype initialPassword when the row omits it", () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      Object.prototype,
      "initialPassword",
    );
    Object.defineProperty(Object.prototype, "initialPassword", {
      configurable: true,
      value: "pollutedPassword123",
      writable: true,
    });

    try {
      expect(
        normalizeEmployeeImportCommandInput({
          commandKind: "single_create",
          organizationPublicId: "organization-public-001",
          rows: [{ phone: "13900000001", name: "Employee" }],
        }),
      ).toEqual({
        success: true,
        value: {
          commandKind: "single_create",
          organizationPublicId: "organization-public-001",
          rows: [
            {
              rowNumber: 1,
              phone: "13900000001",
              name: "Employee",
              initialPassword: "",
            },
          ],
        },
      });
    } finally {
      if (originalDescriptor === undefined) {
        Reflect.deleteProperty(Object.prototype, "initialPassword");
      } else {
        Object.defineProperty(
          Object.prototype,
          "initialPassword",
          originalDescriptor,
        );
      }
    }
  });

  it("rejects single-row and multi-row sparse arrays", () => {
    const singleRowHole = new Array(1);
    const multiRowHole = Object.assign(new Array(3), {
      0: {
        phone: "13900000001",
        name: "Employee One",
        initialPassword: null,
      },
      2: {
        phone: "13900000002",
        name: "Employee Two",
        initialPassword: null,
      },
    });

    for (const rows of [singleRowHole, multiRowHole]) {
      expect(
        normalizeEmployeeImportCommandInput({
          commandKind: rows.length === 1 ? "single_create" : "batch_import",
          organizationPublicId: "organization-public-001",
          rows,
        }),
      ).toEqual({
        success: false,
        message: "Invalid employee import command input.",
      });
    }
  });

  it("rejects custom prototypes and inherited command or row fields", () => {
    const commandWithInheritedEdition = Object.assign(
      Object.create({ edition: "advanced" }),
      validBatchInput,
    );
    const rowWithInheritedIdentity = Object.assign(
      Object.create({ phone: "13900000001", name: "Employee" }),
      { initialPassword: null },
    );

    expect(
      normalizeEmployeeImportCommandInput(commandWithInheritedEdition),
    ).toEqual({
      success: false,
      message: "Invalid employee import command input.",
    });
    expect(
      normalizeEmployeeImportCommandInput({
        ...validBatchInput,
        rows: [rowWithInheritedIdentity],
      }),
    ).toEqual({
      success: false,
      message: "Invalid employee import command input.",
    });
  });

  it("rejects symbol and unknown own keys on commands and rows", () => {
    const unknownKey = Symbol("unknown-command-key");
    const unknownRowKey = Symbol("unknown-row-key");

    expect(
      normalizeEmployeeImportCommandInput({
        ...validBatchInput,
        [unknownKey]: "hidden",
      }),
    ).toEqual({
      success: false,
      message: "Invalid employee import command input.",
    });
    expect(
      normalizeEmployeeImportCommandInput({
        ...validBatchInput,
        rows: [
          {
            ...validBatchInput.rows[0],
            [unknownRowKey]: "hidden",
          },
        ],
      }),
    ).toEqual({
      success: false,
      message: "Invalid employee import command input.",
    });
    expect(
      normalizeEmployeeImportCommandInput({
        ...validBatchInput,
        rawRows: validBatchInput.rows,
      }),
    ).toEqual({
      success: false,
      message: "Invalid employee import command input.",
    });
  });

  it.each([
    ["zero rows", { ...validBatchInput, rows: [] }],
    [
      "more than 500 rows",
      {
        ...validBatchInput,
        rows: Array.from({ length: 501 }, (_, index) => ({
          phone: `139${String(index).padStart(8, "0")}`,
          name: `Employee ${index}`,
          initialPassword: null,
        })),
      },
    ],
    [
      "multiple single-create rows",
      {
        ...validBatchInput,
        commandKind: "single_create",
        rows: [validBatchInput.rows[0], validBatchInput.rows[0]],
      },
    ],
    [
      "a non-string phone",
      {
        ...validBatchInput,
        rows: [{ phone: 13900000001, name: "Employee", initialPassword: null }],
      },
    ],
    [
      "a non-string name",
      {
        ...validBatchInput,
        rows: [{ phone: "13900000001", name: null, initialPassword: null }],
      },
    ],
    [
      "a non-string password",
      {
        ...validBatchInput,
        rows: [
          { phone: "13900000001", name: "Employee", initialPassword: 123 },
        ],
      },
    ],
    [
      "an edition field",
      {
        ...validBatchInput,
        rows: [
          {
            phone: "13900000001",
            name: "Employee",
            initialPassword: null,
            edition: "advanced",
          },
        ],
      },
    ],
    [
      "an organization authorization scope field",
      {
        ...validBatchInput,
        rows: [
          {
            phone: "13900000001",
            name: "Employee",
            initialPassword: null,
            orgAuthScopePublicId: "scope-public-001",
          },
        ],
      },
    ],
  ])("rejects %s as an invalid outer command", (_label, input) => {
    expect(normalizeEmployeeImportCommandInput(input)).toEqual({
      success: false,
      message: "Invalid employee import command input.",
    });
  });
});

describe("credential action input normalization", () => {
  it("accepts exact issue and confirmation bodies", () => {
    expect(
      normalizeCredentialIssueInput({ expectedCredentialRevision: 0 }),
    ).toEqual({
      success: true,
      value: { expectedCredentialRevision: 0 },
    });
    expect(
      normalizeDistributionConfirmationInput({
        issuePublicId: "issue-public-001",
        expectedCredentialRevision: 2,
      }),
    ).toEqual({
      success: true,
      value: {
        issuePublicId: "issue-public-001",
        expectedCredentialRevision: 2,
      },
    });
  });

  it("rejects invalid revisions, public ids, and extra action fields", () => {
    expect(
      normalizeCredentialIssueInput({ expectedCredentialRevision: -1 }),
    ).toEqual({
      success: false,
      message: "Invalid credential issue input.",
    });
    expect(
      normalizeCredentialIssueInput({
        expectedCredentialRevision: 0,
        initialPassword: "must-not-be-accepted",
      }),
    ).toEqual({
      success: false,
      message: "Invalid credential issue input.",
    });
    expect(
      normalizeDistributionConfirmationInput({
        issuePublicId: "",
        expectedCredentialRevision: 1,
      }),
    ).toEqual({
      success: false,
      message: "Invalid distribution confirmation input.",
    });
    expect(
      normalizeDistributionConfirmationInput({
        issuePublicId: "issue-public-001",
        expectedCredentialRevision: 1,
        phone: "13900000001",
      }),
    ).toEqual({
      success: false,
      message: "Invalid distribution confirmation input.",
    });
  });

  it("rejects inherited action fields and custom prototypes", () => {
    const issueWithInheritedRevision = Object.create({
      expectedCredentialRevision: 0,
    });
    const confirmationWithInheritedRevision = Object.assign(
      Object.create({ expectedCredentialRevision: 1 }),
      { issuePublicId: "issue-public-001" },
    );

    expect(normalizeCredentialIssueInput(issueWithInheritedRevision)).toEqual({
      success: false,
      message: "Invalid credential issue input.",
    });
    expect(
      normalizeDistributionConfirmationInput(confirmationWithInheritedRevision),
    ).toEqual({
      success: false,
      message: "Invalid distribution confirmation input.",
    });
  });

  it("rejects symbol own keys on issue and confirmation bodies", () => {
    const unknownIssueKey = Symbol("unknown-issue-key");
    const unknownConfirmationKey = Symbol("unknown-confirmation-key");

    expect(
      normalizeCredentialIssueInput({
        expectedCredentialRevision: 0,
        [unknownIssueKey]: "hidden",
      }),
    ).toEqual({
      success: false,
      message: "Invalid credential issue input.",
    });
    expect(
      normalizeDistributionConfirmationInput({
        issuePublicId: "issue-public-001",
        expectedCredentialRevision: 1,
        [unknownConfirmationKey]: "hidden",
      }),
    ).toEqual({
      success: false,
      message: "Invalid distribution confirmation input.",
    });
  });
});
