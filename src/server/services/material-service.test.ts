import { describe, expect, it } from "vitest";

import { createMaterialService } from "./material-service";
import type {
  MaterialAccessRow,
  MaterialRepository,
} from "../repositories/material-repository";

const createdAt = new Date("2026-05-19T02:00:00.000Z");
const lockedAt = new Date("2026-05-19T03:00:00.000Z");

function createMaterial(
  overrides: Partial<MaterialAccessRow> = {},
): MaterialAccessRow {
  return {
    id: 101,
    public_id: "material_public_123",
    title: "物流案例材料",
    content_rich_text: "<p>仓储作业案例</p>",
    profession: "logistics",
    level: 4,
    subject: "skill",
    status: "available",
    is_locked: false,
    locked_at: null,
    created_at: createdAt,
    updated_at: createdAt,
    ...overrides,
  };
}

function createRepository(
  overrides: Partial<MaterialRepository> = {},
): MaterialRepository {
  return {
    async listMaterials(query) {
      return {
        total: 1,
        rows: [
          createMaterial({
            profession: query.profession ?? "logistics",
            subject: query.subject ?? "skill",
          }),
        ],
      };
    },
    async createMaterial(input) {
      return createMaterial({
        title: input.title,
        content_rich_text: input.contentRichText,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
      });
    },
    async findMaterialByPublicId(publicId) {
      return createMaterial({
        public_id: publicId,
      });
    },
    async updateMaterial(input) {
      return createMaterial({
        public_id: input.publicId,
        title: input.title,
        content_rich_text: input.contentRichText,
        profession: input.profession,
        level: input.level,
        subject: input.subject,
        status: input.status,
      });
    },
    async disableMaterial(publicId) {
      return createMaterial({
        public_id: publicId,
        status: "disabled",
      });
    },
    async copyMaterial(publicId) {
      return createMaterial({
        public_id: `${publicId}_copy`,
        title: "物流案例材料 copy",
        is_locked: false,
        locked_at: null,
      });
    },
    ...overrides,
  };
}

describe("material service", () => {
  it("lists materials with normalized pagination and filters", async () => {
    const receivedQueries: unknown[] = [];
    const service = createMaterialService(
      createRepository({
        async listMaterials(query) {
          receivedQueries.push(query);

          return {
            total: 1,
            rows: [
              createMaterial({
                references: {
                  questions: [
                    {
                      question_public_id: "question_public_123",
                      question_type: "single_choice",
                      status: "available",
                      updated_at: createdAt,
                    },
                  ],
                  papers: [
                    {
                      paper_public_id: "paper_public_123",
                      name: "物流材料引用试卷",
                      paper_status: "published",
                      updated_at: createdAt,
                    },
                  ],
                },
              }),
            ],
          };
        },
      }),
    );

    await expect(
      service.listMaterials({
        page: 0,
        pageSize: 500,
        sortOrder: "sideways",
        profession: "logistics",
        subject: "skill",
        status: "available",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: [
        {
          publicId: "material_public_123",
          contentRichText: "<p>仓储作业案例</p>",
          status: "available",
          isLocked: false,
          references: {
            questions: [
              {
                questionPublicId: "question_public_123",
                questionType: "single_choice",
                status: "available",
                updatedAt: "2026-05-19T02:00:00.000Z",
              },
            ],
            papers: [
              {
                paperPublicId: "paper_public_123",
                name: "物流材料引用试卷",
                paperStatus: "published",
                updatedAt: "2026-05-19T02:00:00.000Z",
              },
            ],
          },
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
        profession: "logistics",
        level: null,
        subject: "skill",
        status: "available",
        keyword: null,
      },
    ]);
  });

  it("creates, reads, updates, disables, and copies material", async () => {
    const service = createMaterialService(createRepository());

    await expect(
      service.createMaterial({
        title: "物流案例材料",
        contentRichText: "<p>仓储作业案例</p>",
        profession: "logistics",
        level: 4,
        subject: "skill",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
          title: "物流案例材料",
        },
      },
    });

    await expect(
      service.getMaterial("material_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
        },
      },
    });

    await expect(
      service.updateMaterial("material_public_123", {
        title: "更新后的材料",
        contentRichText: "<p>更新内容</p>",
        profession: "logistics",
        level: 4,
        subject: "skill",
        status: "available",
      }),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
          title: "更新后的材料",
        },
      },
    });

    await expect(
      service.disableMaterial("material_public_123"),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
          status: "disabled",
        },
      },
    });

    await expect(service.copyMaterial("material_public_123")).resolves.toEqual({
      code: 0,
      message: "ok",
      data: {
        material: {
          publicId: "material_public_123_copy",
          title: "物流案例材料 copy",
          contentRichText: "<p>仓储作业案例</p>",
          profession: "logistics",
          level: 4,
          subject: "skill",
          status: "available",
          isLocked: false,
          lockedAt: null,
          references: {
            questions: [],
            papers: [],
          },
          createdAt: "2026-05-19T02:00:00.000Z",
          updatedAt: "2026-05-19T02:00:00.000Z",
        },
      },
    });
  });

  it("rejects invalid input, missing material, and locked material update", async () => {
    const service = createMaterialService(
      createRepository({
        async findMaterialByPublicId(publicId) {
          if (publicId === "missing_material") {
            return null;
          }

          return createMaterial({
            public_id: publicId,
            is_locked: publicId === "locked_material",
            locked_at: publicId === "locked_material" ? lockedAt : null,
          });
        },
        async disableMaterial(publicId) {
          return publicId === "missing_material" ? null : createMaterial();
        },
        async copyMaterial(publicId) {
          return publicId === "missing_material" ? null : createMaterial();
        },
      }),
    );

    await expect(service.createMaterial({ title: "" })).resolves.toEqual({
      code: 422201,
      message: "Invalid material input.",
      data: null,
    });

    await expect(service.getMaterial("missing_material")).resolves.toEqual({
      code: 404201,
      message: "Material does not exist.",
      data: null,
    });

    await expect(
      service.updateMaterial("locked_material", {
        title: "锁定材料",
        contentRichText: "<p>不可编辑</p>",
        profession: "logistics",
        level: 4,
        subject: "skill",
        status: "available",
      }),
    ).resolves.toEqual({
      code: 409201,
      message: "Locked material cannot be edited.",
      data: null,
    });

    await expect(service.disableMaterial("missing_material")).resolves.toEqual({
      code: 404201,
      message: "Material does not exist.",
      data: null,
    });

    await expect(service.copyMaterial("missing_material")).resolves.toEqual({
      code: 404201,
      message: "Material does not exist.",
      data: null,
    });
  });
});
