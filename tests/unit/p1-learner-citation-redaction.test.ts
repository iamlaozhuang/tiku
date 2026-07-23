import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  LearnerCitationProjectionError,
  mapLearnerCitations,
} from "@/server/mappers/learner-citation-mapper";

const repositoryRoot = resolve(process.cwd());
const forbiddenFields = [
  "chunkText",
  "textHash",
  "score",
  "chunkIndex",
  "chunkPublicId",
  "resourcePublicId",
  "generationPublicId",
] as const;

function readText(path: string): string {
  return readFileSync(resolve(repositoryRoot, path), "utf8");
}

function parseYamlStrictly(path: string): Record<string, unknown> {
  const repositoryRequire = createRequire(import.meta.url);
  const viteRequire = createRequire(
    repositoryRequire.resolve("vite/package.json"),
  );
  const { parseDocument } = viteRequire("yaml") as {
    parseDocument: (
      source: string,
      options: { strict: boolean; uniqueKeys: boolean },
    ) => { errors: unknown[]; toJS: () => unknown };
  };
  const document = parseDocument(readText(path), {
    strict: true,
    uniqueKeys: true,
  });

  expect(document.errors).toEqual([]);
  return document.toJS() as Record<string, unknown>;
}

function createInternalCitation(overrides: Record<string, unknown> = {}) {
  return {
    chunkPublicId: "chunk_public_private",
    generationPublicId: "generation_public_private",
    resourcePublicId: "resource_public_private",
    resourceTitle: " 专卖管理教材 ",
    headingPath: [" 第三篇 ", "第一章"],
    chunkIndex: 7,
    chunkText: "private chunk text",
    textHash: "private-text-hash",
    isStale: false,
    score: 0.97,
    debugMetadata: { secret: "private-debug-value" },
    ...overrides,
  };
}

describe("F-0150 learner citation redaction", () => {
  it("strictly parses the F-0150 task contract and WIP state", () => {
    const taskSafety = JSON.parse(
      readText("docs/04-agent-system/state/task-safety.json"),
    ) as Record<string, unknown>;
    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    );
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    );

    expect(taskSafety).toMatchObject({
      taskId: "p1-remediation-rc-08-learner-citation-redaction-2026-07-23",
      branch: "fix/learner-citation-redaction",
      baseSha: "5bf667ec899d689fc5a5ab216efa9915e1c3e250",
      conditionalCloseout: true,
      approvalSources: {
        permission: "guardian-f0150-learner-citation-redaction-2026-07-23",
      },
    });
    expect(JSON.stringify(projectState)).toContain(
      "p1-remediation-rc-08-learner-citation-redaction-2026-07-23",
    );
    expect(JSON.stringify(taskQueue)).toContain(
      "p1-remediation-rc-08-learner-citation-redaction-2026-07-23",
    );
  });

  it("creates only detached learner-visible fields from hostile internal input", () => {
    const prototype = {
      chunkText: "prototype-private-chunk",
      resourcePublicId: "prototype-private-resource",
    };
    const internal = Object.assign(
      Object.create(prototype),
      createInternalCitation(),
    ) as ReturnType<typeof createInternalCitation>;
    const result = mapLearnerCitations({
      evidenceStatus: "sufficient",
      citations: [internal],
    });

    expect(result).toEqual([
      {
        resourceTitle: "专卖管理教材",
        headingPath: ["第三篇", "第一章"],
        isStale: false,
      },
    ]);
    const serialized = JSON.stringify(result);

    for (const field of forbiddenFields) {
      expect(serialized).not.toContain(field);
    }
    expect(serialized).not.toContain("private");

    internal.resourceTitle = "mutated internal title";
    internal.headingPath[0] = "mutated internal path";
    expect(result[0]).toEqual({
      resourceTitle: "专卖管理教材",
      headingPath: ["第三篇", "第一章"],
      isStale: false,
    });

    result[0]!.resourceTitle = "mutated output title";
    result[0]!.headingPath[0] = "mutated output path";
    expect(internal.resourceTitle).toBe("mutated internal title");
    expect(internal.headingPath[0]).toBe("mutated internal path");
  });

  it("normalizes missing stale state, sorts public facts and deduplicates exact tuples", () => {
    const betaHighScore = createInternalCitation({
      resourceTitle: "Beta",
      headingPath: ["Two"],
      score: 1,
      chunkIndex: 1,
    });
    const betaLowScore = createInternalCitation({
      resourceTitle: "Beta",
      headingPath: ["Two"],
      score: -100,
      chunkIndex: -100,
    });
    Reflect.deleteProperty(betaHighScore, "isStale");
    Reflect.deleteProperty(betaLowScore, "isStale");
    const result = mapLearnerCitations({
      evidenceStatus: "sufficient",
      citations: [
        betaHighScore,
        createInternalCitation({
          resourceTitle: "Alpha",
          headingPath: ["One"],
          isStale: true,
          score: 0,
          chunkIndex: 99,
        }),
        betaLowScore,
      ],
    });

    expect(result).toEqual([
      { resourceTitle: "Alpha", headingPath: ["One"], isStale: true },
      { resourceTitle: "Beta", headingPath: ["Two"], isStale: null },
    ]);
  });

  it("fails the whole projection for malformed or amplified input", () => {
    const sparseCitations = new Array(1);
    const sparseHeadingPath = new Array(1);
    const accessorHeadingPath: unknown[] = [];
    Object.defineProperty(accessorHeadingPath, "0", {
      configurable: true,
      enumerable: true,
      get() {
        return "unsafe getter segment";
      },
    });
    accessorHeadingPath.length = 1;
    const malformedInputs: Array<{
      evidenceStatus: unknown;
      citations: unknown;
    }> = [
      { evidenceStatus: "sufficient", citations: null },
      { evidenceStatus: "sufficient", citations: sparseCitations },
      { evidenceStatus: "unknown", citations: [] },
      { evidenceStatus: "sufficient", citations: [] },
      { evidenceStatus: "weak", citations: [createInternalCitation()] },
      { evidenceStatus: "none", citations: [createInternalCitation()] },
      {
        evidenceStatus: "sufficient",
        citations: Array.from({ length: 4 }, () => createInternalCitation()),
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ resourceTitle: " " })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ resourceTitle: "a".repeat(201) })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ resourceTitle: "unsafe\nname" })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [
          createInternalCitation({ resourceTitle: "unsafe\u202ename" }),
        ],
      },
      {
        evidenceStatus: "sufficient",
        citations: [
          createInternalCitation({ resourceTitle: "unsafe\ud800name" }),
        ],
      },
      {
        evidenceStatus: "sufficient",
        citations: [
          createInternalCitation({ resourceTitle: "unsafe\ufffename" }),
        ],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ headingPath: "not-an-array" })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ headingPath: sparseHeadingPath })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [
          createInternalCitation({ headingPath: accessorHeadingPath }),
        ],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ headingPath: [""] })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ headingPath: ["a".repeat(201)] })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [
          createInternalCitation({
            headingPath: Array.from({ length: 13 }, (_, index) =>
              String(index),
            ),
          }),
        ],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation({ isStale: "false" })],
      },
      {
        evidenceStatus: "sufficient",
        citations: [createInternalCitation(), { resourceTitle: "bad" }],
      },
    ];

    for (const input of malformedInputs) {
      expect(() => mapLearnerCitations(input)).toThrow(
        LearnerCitationProjectionError,
      );
      expect(() => mapLearnerCitations(input)).toThrow(
        "Learner citation projection is unavailable.",
      );
    }
  });

  it("rejects conflicting stale facts instead of guessing", () => {
    expect(() =>
      mapLearnerCitations({
        evidenceStatus: "sufficient",
        citations: [
          createInternalCitation({ isStale: false }),
          createInternalCitation({ isStale: true }),
        ],
      }),
    ).toThrow(LearnerCitationProjectionError);
  });

  it("keeps learner contracts and sinks structurally separate from internal citations", () => {
    const mistakeContract = readText(
      "src/server/contracts/mistake-book-contract.ts",
    );
    const practiceContract = readText(
      "src/server/contracts/practice-contract.ts",
    );
    const mistakeRuntime = readText(
      "src/server/services/student-mistake-book-runtime.ts",
    );
    const practiceMapper = readText("src/server/mappers/practice-mapper.ts");
    const learnerUi = readText(
      "src/features/student/mistake-book/StudentMistakeBookPage.tsx",
    );

    expect(mistakeContract).not.toContain("RagCitationDto");
    expect(practiceContract).not.toContain("RagCitationDto");
    expect(mistakeRuntime).toContain("mapLearnerCitations({");
    expect(practiceMapper.match(/mapLearnerCitations\(\{/gu)).toHaveLength(2);
    expect(learnerUi).not.toContain("resourcePublicId");
    expect(learnerUi).not.toContain("chunkPublicId");
    expect(learnerUi).not.toContain("generationPublicId");
  });
});
