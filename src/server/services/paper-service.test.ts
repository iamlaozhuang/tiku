import { describe, expect, it } from "vitest";

import { createPaperService } from "./paper-service";
import type { PaperRepository } from "../repositories/paper-repository";

describe("paper service", () => {
  it("normalizes pagination, delegates to the repository, and returns mapped papers", async () => {
    const receivedQueries: unknown[] = [];
    const paperRepository = {
      async listPapers(query) {
        receivedQueries.push(query);

        return {
          total: 1,
          rows: [
            {
              id: 7,
              public_id: "paper_public_id",
              title: "物流技能真题",
              profession: "logistics",
              level: 4,
              subject: "skill",
              paper_type: "past_paper",
              paper_status: "published",
              description: "技能实操卷",
              created_at: new Date("2026-05-12T12:00:00.000Z"),
              updated_at: new Date("2026-05-13T12:00:00.000Z"),
              published_at: new Date("2026-05-14T12:00:00.000Z"),
            },
          ],
        };
      },
    } satisfies PaperRepository;

    const paperService = createPaperService(paperRepository);

    await expect(
      paperService.listPapers({
        page: 0,
        pageSize: 500,
        sortOrder: "sideways",
      }),
    ).resolves.toEqual({
      code: 0,
      message: "ok",
      data: [
        {
          publicId: "paper_public_id",
          title: "物流技能真题",
          profession: "logistics",
          level: 4,
          subject: "skill",
          paperType: "past_paper",
          paperStatus: "published",
          description: "技能实操卷",
          createdAt: "2026-05-12T12:00:00.000Z",
          updatedAt: "2026-05-13T12:00:00.000Z",
          publishedAt: "2026-05-14T12:00:00.000Z",
        },
      ],
      pagination: {
        page: 1,
        pageSize: 100,
        total: 1,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    });
    expect(receivedQueries).toEqual([
      {
        page: 1,
        pageSize: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
    ]);
  });
});
