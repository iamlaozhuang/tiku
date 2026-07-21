import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { shouldRestartKnowledgeRecommendationTask } from "@/server/repositories/knowledge-recommendation-runtime-repository";

describe("F-0078 durable knowledge recommendation retry", () => {
  it("restarts only a failed task for the same question revision", () => {
    expect(shouldRestartKnowledgeRecommendationTask("failed")).toBe(true);

    for (const taskStatus of [
      "pending",
      "running",
      "succeeded",
      "superseded",
    ] as const) {
      expect(shouldRestartKnowledgeRecommendationTask(taskStatus)).toBe(false);
    }
  });

  it("locks the existing revision task and clears its failure before requeueing", () => {
    const source = readFileSync(
      resolve(
        process.cwd(),
        "src/server/repositories/knowledge-recommendation-runtime-repository.ts",
      ),
      "utf8",
    );
    const enqueueSource = source.slice(
      source.indexOf(
        "export async function enqueueKnowledgeRecommendationTask",
      ),
      source.indexOf(
        "export async function supersedeKnowledgeRecommendationTasks",
      ),
    );

    expect(enqueueSource).toContain('.for("update")');
    expect(enqueueSource).toContain("shouldRestartKnowledgeRecommendationTask");
    expect(enqueueSource).toContain('task_status: "pending"');
    expect(enqueueSource).toContain("failure_code: null");
    expect(enqueueSource).toContain("completed_at: null");
    expect(enqueueSource).toContain("request_public_id:");
  });
});
