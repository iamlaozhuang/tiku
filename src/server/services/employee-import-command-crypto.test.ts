import { Buffer } from "node:buffer";

import { describe, expect, it, vi } from "vitest";

import {
  createEmployeeImportCommandHashes,
  prepareEmployeeCreationCredential,
  prepareIssuedEmployeeCredential,
} from "./employee-import-command-crypto";

const idempotencyKey = "00000000-0000-4000-8000-000000000001";
const normalizedCommand = {
  commandKind: "batch_import" as const,
  organizationPublicId: "organization-public-001",
  rows: [
    {
      rowNumber: 1,
      phone: "13900000001",
      name: "Employee One",
      initialPassword: "employee123",
    },
    {
      rowNumber: 2,
      phone: "13900000002",
      name: "Employee Two",
      initialPassword: "",
    },
  ],
};

describe("createEmployeeImportCommandHashes", () => {
  it("creates stable v1 domain-separated hashes without returning raw values", () => {
    const firstHashes = createEmployeeImportCommandHashes({
      actorPublicId: "admin-public-001",
      idempotencyKey,
      command: normalizedCommand,
    });
    const secondHashes = createEmployeeImportCommandHashes({
      actorPublicId: "admin-public-001",
      idempotencyKey,
      command: normalizedCommand,
    });

    expect(secondHashes).toEqual(firstHashes);
    expect(firstHashes).toEqual({
      idempotencyScopeHash: "v1:zs6l2wiZfgXY_Cv6xB1yIzfA38hUSl49l002DCEOh_A",
      requestHash: "v1:cTyUfkSRUd_BMYxXZ9Vl48UDIm2f6f6m06F2HDO7-k8",
      rowHashes: [
        "v1:lTOJ2xOIQjs0im_gdY1uSMdZrNvXf_OfE5mdtik9byo",
        "v1:a7B8ID_6bUst3O86RGRfm9tjjr8nEXVS6n_sCgJPUKs",
      ],
    });
    expect(firstHashes.idempotencyScopeHash).toMatch(/^v1:/u);
    expect(firstHashes.requestHash).toMatch(/^v1:/u);
    expect(firstHashes.rowHashes).toHaveLength(2);
    expect(
      firstHashes.rowHashes.every((rowHash) => rowHash.startsWith("v1:")),
    ).toBe(true);
    expect(
      new Set([
        firstHashes.idempotencyScopeHash,
        firstHashes.requestHash,
        ...firstHashes.rowHashes,
      ]).size,
    ).toBe(4);

    const serializedHashes = JSON.stringify(firstHashes);
    for (const rawValue of [
      idempotencyKey,
      "admin-public-001",
      normalizedCommand.organizationPublicId,
      ...normalizedCommand.rows.flatMap((row) => [
        row.phone,
        row.name,
        row.initialPassword,
      ]),
    ]) {
      if (rawValue.length > 0) {
        expect(serializedHashes).not.toContain(rawValue);
      }
    }
  });

  it("canonicalizes command and row property order without changing v1 hashes", () => {
    const baselineHashes = createEmployeeImportCommandHashes({
      actorPublicId: "admin-public-001",
      idempotencyKey,
      command: normalizedCommand,
    });
    const reorderedCommand = {
      rows: normalizedCommand.rows.map((row) => ({
        initialPassword: row.initialPassword,
        name: row.name,
        phone: row.phone,
        rowNumber: row.rowNumber,
      })),
      organizationPublicId: normalizedCommand.organizationPublicId,
      commandKind: normalizedCommand.commandKind,
    };
    const deepClonedCommand = JSON.parse(
      JSON.stringify(reorderedCommand),
    ) as typeof normalizedCommand;

    const reorderedHashes = createEmployeeImportCommandHashes({
      actorPublicId: "admin-public-001",
      idempotencyKey,
      command: deepClonedCommand,
    });

    expect(reorderedHashes.requestHash).toBe(baselineHashes.requestHash);
    expect(reorderedHashes.rowHashes).toEqual(baselineHashes.rowHashes);
  });

  it("changes when any idempotency identity or canonical request field changes", () => {
    const baselineHashes = createEmployeeImportCommandHashes({
      actorPublicId: "admin-public-001",
      idempotencyKey,
      command: normalizedCommand,
    });
    const changedActorHashes = createEmployeeImportCommandHashes({
      actorPublicId: "admin-public-002",
      idempotencyKey,
      command: normalizedCommand,
    });
    const changedOrganizationHashes = createEmployeeImportCommandHashes({
      actorPublicId: "admin-public-001",
      idempotencyKey,
      command: {
        ...normalizedCommand,
        organizationPublicId: "organization-public-002",
      },
    });

    expect(changedActorHashes.idempotencyScopeHash).not.toBe(
      baselineHashes.idempotencyScopeHash,
    );
    expect(changedOrganizationHashes.idempotencyScopeHash).not.toBe(
      baselineHashes.idempotencyScopeHash,
    );

    const requestVariants = [
      {
        ...normalizedCommand,
        commandKind: "single_create" as const,
        rows: [normalizedCommand.rows[0]],
      },
      {
        ...normalizedCommand,
        rows: [...normalizedCommand.rows].reverse(),
      },
      {
        ...normalizedCommand,
        rows: normalizedCommand.rows.map((row, index) =>
          index === 0 ? { ...row, phone: "13900000009" } : row,
        ),
      },
      {
        ...normalizedCommand,
        rows: normalizedCommand.rows.map((row, index) =>
          index === 0 ? { ...row, name: "Changed Name" } : row,
        ),
      },
      {
        ...normalizedCommand,
        rows: normalizedCommand.rows.map((row, index) =>
          index === 0 ? { ...row, initialPassword: "changed123" } : row,
        ),
      },
    ];

    for (const command of requestVariants) {
      const variantHashes = createEmployeeImportCommandHashes({
        actorPublicId: "admin-public-001",
        idempotencyKey,
        command,
      });
      expect(variantHashes.requestHash).not.toBe(baselineHashes.requestHash);
    }
  });
});

describe("credential preparation", () => {
  it("hashes a provided password without generating or returning another secret", async () => {
    const generateRandomBytes = vi.fn(() => Buffer.alloc(32, 1));
    const hashPassword = vi.fn(async (password: string) => `hash:${password}`);

    const credential = await prepareEmployeeCreationCredential("employee123", {
      generateRandomBytes,
      hashPassword,
    });

    expect(credential).toEqual({
      credentialMode: "provided",
      passwordHash: "hash:employee123",
    });
    expect(generateRandomBytes).not.toHaveBeenCalled();
    expect(hashPassword).toHaveBeenCalledWith("employee123");
  });

  it("hashes an unknowable placeholder without returning its plaintext", async () => {
    const randomBytesValue = Buffer.alloc(32, 7);
    const generateRandomBytes = vi.fn(() => randomBytesValue);
    let hashedPlaintext = "";
    const hashPassword = vi.fn(async (password: string) => {
      hashedPlaintext = password;
      return "placeholder-hash";
    });

    const credential = await prepareEmployeeCreationCredential("", {
      generateRandomBytes,
      hashPassword,
    });

    expect(credential).toEqual({
      credentialMode: "generated",
      passwordHash: "placeholder-hash",
    });
    expect(generateRandomBytes).toHaveBeenCalledWith(32);
    expect(hashedPlaintext).toBe(`${randomBytesValue.toString("base64url")}A1`);
    expect(JSON.stringify(credential)).not.toContain(hashedPlaintext);
    expect(credential).not.toHaveProperty("initialPassword");
  });

  it("generates and hashes a 12-character policy-compliant issued password", async () => {
    const generateRandomBytes = vi.fn(() => Buffer.alloc(12));
    const hashPassword = vi.fn(async (password: string) => `hash:${password}`);

    const credential = await prepareIssuedEmployeeCredential({
      generateRandomBytes,
      hashPassword,
    });

    expect(credential.initialPassword).toHaveLength(12);
    expect(credential.initialPassword).toMatch(
      /^(?=.*[A-Za-z])(?=.*\d).{12}$/u,
    );
    expect(credential.passwordHash).toBe(`hash:${credential.initialPassword}`);
    expect(generateRandomBytes).toHaveBeenCalledWith(12);
    expect(hashPassword).toHaveBeenCalledWith(credential.initialPassword);
  });

  it("propagates random generation failures without adding secret material", async () => {
    const randomFailure = new Error("Random source unavailable.");
    const generateRandomBytes = vi.fn(() => {
      throw randomFailure;
    });
    const hashPassword = vi.fn(async () => "unused-hash");

    await expect(
      prepareEmployeeCreationCredential("", {
        generateRandomBytes,
        hashPassword,
      }),
    ).rejects.toBe(randomFailure);
    expect(randomFailure.message).not.toMatch(/password|credential/iu);
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it("propagates password hash failures without adding the provided password", async () => {
    const initialPassword = "providedSecret123";
    const hashFailure = new Error("Hash service unavailable.");
    const hashPassword = vi.fn(async () => {
      throw hashFailure;
    });

    await expect(
      prepareEmployeeCreationCredential(initialPassword, { hashPassword }),
    ).rejects.toBe(hashFailure);
    expect(hashFailure.message).not.toContain(initialPassword);
  });

  it("propagates issued credential hash failures without adding generated plaintext", async () => {
    const hashFailure = new Error("Hash service unavailable.");
    let generatedPassword = "";
    const hashPassword = vi.fn(async (password: string) => {
      generatedPassword = password;
      throw hashFailure;
    });

    await expect(
      prepareIssuedEmployeeCredential({
        generateRandomBytes: () => Buffer.alloc(12, 3),
        hashPassword,
      }),
    ).rejects.toBe(hashFailure);
    expect(generatedPassword).toHaveLength(12);
    expect(hashFailure.message).not.toContain(generatedPassword);
  });
});
