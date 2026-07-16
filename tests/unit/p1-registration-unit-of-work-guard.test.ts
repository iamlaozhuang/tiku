import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

function readSource(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("P1 registration unit-of-work guard", () => {
  it("keeps service orchestration behind one repository command", () => {
    const serviceSource = readSource(
      "src/server/services/user-registration-service.ts",
    );

    expect(serviceSource).toContain("createPersonalRegistration");
    expect(serviceSource).not.toContain("createPasswordCredential");
    expect(serviceSource).not.toContain("createPersonalUser");
    expect(serviceSource).not.toContain("createSingleActiveSession");
  });

  it("keeps all registration writers in the same locked transaction", () => {
    const runtimeSource = readSource(
      "src/server/auth/local-session-runtime.ts",
    );
    const repositoryStart = runtimeSource.indexOf(
      "function createPostgresUserRegistrationRepository",
    );
    const repositoryEnd = runtimeSource.indexOf(
      "function createLazyDatabaseGetter",
      repositoryStart,
    );
    const repositorySource = runtimeSource.slice(
      repositoryStart,
      repositoryEnd,
    );

    expect(repositoryStart).toBeGreaterThan(-1);
    expect(repositoryEnd).toBeGreaterThan(repositoryStart);
    expect(repositorySource.match(/database\.transaction\(/gu)).toHaveLength(1);

    const orderedAnchors = [
      "lockRegistrationAttempt",
      "findAccountPhoneIdentityConflictUnderLock",
      ".insert(authUser)",
      ".insert(authAccount)",
      ".insert(user)",
      ".insert(student)",
      ".insert(authSession)",
    ];
    const positions = orderedAnchors.map((anchor) =>
      repositorySource.indexOf(anchor),
    );

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual(
      [...positions].sort((left, right) => left - right),
    );

    const identitySource = readSource(
      "src/server/repositories/user-registration-repository.ts",
    );
    const identityStart = identitySource.indexOf(
      "function createRegistrationSessionId",
    );
    const identityEnd = identitySource.indexOf("}", identityStart);
    const identityFunction = identitySource.slice(identityStart, identityEnd);

    expect(identityFunction).toContain("idempotencyKey");
    expect(identityFunction).not.toContain("password");
    expect(identityFunction).not.toContain("phone");
    expect(identityFunction).not.toContain("name");
  });
});
