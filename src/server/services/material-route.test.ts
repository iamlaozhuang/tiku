import { describe, expect, it } from "vitest";

import { createMaterialRouteHandlers } from "./material-route";
import type { MaterialService } from "./material-service";

const materialDto = {
  publicId: "material_public_123",
  title: "物流案例材料",
  contentRichText: "<p>仓储作业案例</p>",
  profession: "logistics",
  level: 4,
  subject: "skill",
  status: "available",
  isLocked: false,
  lockedAt: null,
  createdAt: "2026-05-19T02:00:00.000Z",
  updatedAt: "2026-05-19T02:00:00.000Z",
} as const;

function createService(): MaterialService {
  return {
    async listMaterials() {
      return {
        code: 0,
        message: "ok",
        data: [materialDto],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      };
    },
    async createMaterial() {
      return {
        code: 0,
        message: "ok",
        data: {
          material: materialDto,
        },
      };
    },
    async getMaterial(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          material: {
            ...materialDto,
            publicId,
          },
        },
      };
    },
    async updateMaterial(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          material: {
            ...materialDto,
            publicId,
          },
        },
      };
    },
    async disableMaterial(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          material: {
            ...materialDto,
            publicId,
            status: "disabled",
          },
        },
      };
    },
    async copyMaterial(publicId) {
      return {
        code: 0,
        message: "ok",
        data: {
          material: {
            ...materialDto,
            publicId: `${publicId}_copy`,
          },
        },
      };
    },
  };
}

describe("material route handlers", () => {
  it("returns standard list and create responses", async () => {
    const handlers = createMaterialRouteHandlers(createService());

    await expect(
      handlers
        .GET(
          new Request(
            "http://localhost/api/v1/materials?page=1&pageSize=20&profession=logistics",
          ),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      message: "ok",
      data: [
        {
          publicId: "material_public_123",
        },
      ],
    });

    await expect(
      handlers
        .POST(
          new Request("http://localhost/api/v1/materials", {
            method: "POST",
            body: JSON.stringify({
              title: "物流案例材料",
              contentRichText: "<p>仓储作业案例</p>",
              profession: "logistics",
              level: 4,
              subject: "skill",
            }),
          }),
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
        },
      },
    });
  });

  it("uses publicId route params for detail, update, disable, and copy", async () => {
    const handlers = createMaterialRouteHandlers(createService());
    const context = {
      params: Promise.resolve({
        publicId: "material_public_123",
      }),
    };

    await expect(
      handlers
        .GET(
          new Request("http://localhost/api/v1/materials/material_public_123"),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
        },
      },
    });

    await expect(
      handlers
        .PATCH(
          new Request("http://localhost/api/v1/materials/material_public_123", {
            method: "PATCH",
            body: JSON.stringify({
              title: "更新后的材料",
              contentRichText: "<p>更新内容</p>",
              profession: "logistics",
              level: 4,
              subject: "skill",
              status: "available",
            }),
          }),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
        },
      },
    });

    await expect(
      handlers.disable
        .POST(
          new Request(
            "http://localhost/api/v1/materials/material_public_123/disable",
            {
              method: "POST",
            },
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123",
          status: "disabled",
        },
      },
    });

    await expect(
      handlers.copy
        .POST(
          new Request(
            "http://localhost/api/v1/materials/material_public_123/copy",
            {
              method: "POST",
            },
          ),
          context,
        )
        .then((response) => response.json()),
    ).resolves.toMatchObject({
      code: 0,
      data: {
        material: {
          publicId: "material_public_123_copy",
        },
      },
    });
  });
});
