import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();

function resolveAllowedSource(sourcePath: string) {
  return join(workspaceRoot, sourcePath);
}

function readAllowedSource(sourcePath: string) {
  return readFileSync(resolveAllowedSource(sourcePath), "utf8");
}

function expectAllowedSourceExists(sourcePath: string) {
  const absoluteSourcePath = resolveAllowedSource(sourcePath);

  expect(existsSync(absoluteSourcePath)).toBe(true);

  return absoluteSourcePath;
}

describe("unified repair question paper REST layering", () => {
  it("exposes exam paper REST adapters through the scoped question-paper layer", async () => {
    const routeSourcePath = expectAllowedSourceExists(
      "src/app/api/v1/exam-papers/route.ts",
    );
    const routeSource = readFileSync(routeSourcePath, "utf8");
    const routeHandlersSourcePath = expectAllowedSourceExists(
      "src/server/services/question-paper/route-handlers.ts",
    );

    expect(routeSource).toContain("createQuestionPaperRouteHandlers");
    expect(routeSource).toContain("examPapers.collection.GET");
    expect(routeSource).toContain("examPapers.collection.POST");

    const { createQuestionPaperRouteHandlers } = await import(
      pathToFileURL(routeHandlersSourcePath).href
    );
    const handlers = createQuestionPaperRouteHandlers({
      repository: {
        async listExamPapers() {
          return {
            examPapers: [
              {
                paperType: "mock_paper",
                publicId: "paper-public-001",
                status: "draft",
                title: "synthetic paper metadata",
              },
            ],
            pagination: {
              page: 1,
              pageSize: 10,
              sortBy: "createdAt",
              sortOrder: "desc",
              total: 1,
            },
          };
        },
      },
    });

    const response = await handlers.examPapers.collection.GET(
      new Request("http://localhost/api/v1/exam-papers?page=1&pageSize=10"),
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      data: {
        examPapers: [
          {
            paperType: "mock_paper",
            publicId: "paper-public-001",
            status: "draft",
            title: "synthetic paper metadata",
          },
        ],
      },
      message: "ok",
      pagination: {
        page: 1,
        pageSize: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        total: 1,
      },
    });
  });

  it("keeps paper publish actions publicId based and standard-envelope shaped", async () => {
    const publishRouteSourcePath = expectAllowedSourceExists(
      "src/app/api/v1/exam-papers/[publicId]/publish/route.ts",
    );
    const publishRouteSource = readFileSync(publishRouteSourcePath, "utf8");
    const routeHandlersSourcePath = expectAllowedSourceExists(
      "src/server/services/question-paper/route-handlers.ts",
    );

    expect(publishRouteSource).toContain("examPapers.publish.POST");
    expect(publishRouteSource).not.toContain("[id]");

    const { createQuestionPaperRouteHandlers } = await import(
      pathToFileURL(routeHandlersSourcePath).href
    );
    const handlers = createQuestionPaperRouteHandlers({
      repository: {
        async publishExamPaper(publicId: string) {
          return {
            paperType: "mock_paper",
            publicId,
            publishedAt: "2026-06-14T17:30:00.000Z",
            status: "published",
            title: "synthetic paper metadata",
          };
        },
      },
    });

    const response = await handlers.examPapers.publish.POST(
      new Request(
        "http://localhost/api/v1/exam-papers/paper-public-001/publish",
        {
          method: "POST",
        },
      ),
      { params: Promise.resolve({ publicId: "paper-public-001" }) },
    );

    await expect(response.json()).resolves.toEqual({
      code: 0,
      data: {
        examPaper: {
          paperType: "mock_paper",
          publicId: "paper-public-001",
          publishedAt: "2026-06-14T17:30:00.000Z",
          status: "published",
          title: "synthetic paper metadata",
        },
      },
      message: "ok",
    });
  });

  it("records material lifecycle boundaries without schema or storage work", async () => {
    const materialPageSource = readAllowedSource(
      "src/app/(admin)/content/materials/page.tsx",
    );
    const materialBoundarySourcePath = expectAllowedSourceExists(
      "src/server/contracts/question-paper/material-lifecycle-boundary.ts",
    );
    const materialBoundarySource = readFileSync(
      materialBoundarySourcePath,
      "utf8",
    );

    expect(materialPageSource).toContain('defaultView="materials"');
    expect(materialBoundarySource).toContain(
      'schemaMigrationStatus: "blocked"',
    );
    expect(materialBoundarySource).toContain('objectStorageStatus: "blocked"');
    expect(materialBoundarySource).not.toContain("storageUrl");
  });
});
