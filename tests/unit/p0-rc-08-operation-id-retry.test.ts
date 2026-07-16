import { describe, expect, it } from "vitest";

import {
  resolvePendingOrganizationTrainingOperationId,
  type PendingOrganizationTrainingOperation,
} from "../../src/features/organization-training-operation";

describe("P0 RC-08 operation id retry contract", () => {
  it("reuses one operation id for an identical retry and rotates it after payload change", () => {
    const operations = new Map<string, PendingOrganizationTrainingOperation>();

    const first = resolvePendingOrganizationTrainingOperationId(
      operations,
      "training_1:publish",
      "digest_a",
    );
    const retry = resolvePendingOrganizationTrainingOperationId(
      operations,
      "training_1:publish",
      "digest_a",
    );
    const changed = resolvePendingOrganizationTrainingOperationId(
      operations,
      "training_1:publish",
      "digest_b",
    );

    expect(retry).toBe(first);
    expect(changed).not.toBe(first);
  });
});
