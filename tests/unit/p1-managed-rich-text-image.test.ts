import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StudentRichText } from "@/components/StudentRichText/StudentRichText";

afterEach(() => cleanup());

describe("F-0052 managed rich text image boundary", () => {
  it("renders canonical content_image bytes but never external or legacy metadata image sources", () => {
    const { rerender } = render(
      createElement(StudentRichText, {
        value:
          '<p>正文</p><img src="https://tracker.example/pixel.png" alt="外链" />',
      }),
    );

    expect(screen.getByText("正文")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    rerender(
      createElement(StudentRichText, {
        value:
          '<img src="/api/v1/paper-assets/paper-asset-public-1" alt="旧元数据引用" />',
      }),
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    rerender(
      createElement(StudentRichText, {
        value:
          '<img src="/api/v1/content-images/content-image-public-1" data-content-image-public-id="content-image-public-1" alt="流程图" />',
      }),
    );
    expect(screen.getByRole("img", { name: "流程图" })).toHaveAttribute(
      "src",
      "/api/v1/content-images/content-image-public-1",
    );
  });
});
