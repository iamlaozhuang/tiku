import { describe, expect, it, vi } from "vitest";

import { createSuccessResponse } from "../contracts/api-response";

describe("content_image runtime", () => {
  it("requires content-admin upload and any active session for private bytes", async () => {
    const runtimeModule = await import("./content-image-runtime").catch(
      () => ({}),
    );
    const createHandlers = Reflect.get(
      runtimeModule,
      "createContentImageRuntimeRouteHandlers",
    );

    expect(typeof createHandlers).toBe("function");
    const sessionService = {
      getCurrentSession: vi.fn().mockResolvedValue(
        createSuccessResponse({
          user: {
            publicId: "user-1",
            adminPublicId: null,
            adminRoles: [],
          },
        }),
      ),
    };
    const handlers = createHandlers({
      sessionService,
      contentImageService: {
        uploadContentImage: vi.fn(),
        readContentImage: vi.fn().mockResolvedValue({
          status: "found",
          bytes: Buffer.from([1, 2, 3]),
          contentType: "image/png",
        }),
      },
    });

    const uploadResponse = await handlers.collection.POST(
      new Request("http://localhost/api/v1/content-images", { method: "POST" }),
    );
    expect(uploadResponse.status).toBe(403);
    const byteResponse = await handlers.detail.GET(
      new Request("http://localhost/api/v1/content-images/content-image-1"),
      { params: Promise.resolve({ publicId: "content-image-1" }) },
    );
    expect(byteResponse.status).toBe(200);
    expect(byteResponse.headers.get("content-type")).toBe("image/png");
    expect(byteResponse.headers.get("cache-control")).toBe("private, no-store");
    expect(byteResponse.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("fails closed for anonymous byte reads", async () => {
    const runtimeModule = await import("./content-image-runtime");
    const handlers = runtimeModule.createContentImageRuntimeRouteHandlers({
      sessionService: {
        getCurrentSession: vi.fn().mockResolvedValue({
          code: 401001,
          message: "User session is required.",
          data: null,
        }),
      },
      contentImageService: {
        uploadContentImage: vi.fn(),
        readContentImage: vi.fn(),
      },
    });

    const response = await handlers.detail.GET(
      new Request("http://localhost/api/v1/content-images/content-image-1"),
      { params: Promise.resolve({ publicId: "content-image-1" }) },
    );
    expect(response.status).toBe(401);
  });
});
