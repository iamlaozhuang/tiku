import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AdminAiAuditLogOpsBaseline } from "./AdminAiAuditLogOpsBaseline";

function createFormalAdoptionReviewResponse() {
  return {
    code: 0,
    message: "ok",
    data: {
      adoptionReview: {
        sourceResultPublicId: "personal_ai_result_public_admin_901",
        sourceTaskPublicId: "ai_generation_task_public_admin_901",
        sourceOwnerPublicId: "student_public_admin_901",
        targetType: "question",
        reviewDecision: "approved",
        reviewStatus: "approved_for_manual_adoption",
        formalTargetWriteStatus: "blocked_without_follow_up_task",
        reviewerPublicId: "admin_content_public_901",
        reviewedAt: "2026-06-15T09:30:00.000Z",
        sourceReference: {
          contentDigest: "sha256:formal_review_admin_901",
          contentPreviewMasked: "masked preview for admin review",
          evidenceStatus: "weak",
          citationCount: 1,
          aiCallLogPublicId: "ai_call_log_public_admin_901",
          redactionStatus: "redacted",
          unsafeRawPromptEcho: "DO_NOT_RENDER_RAW_PROMPT",
          unsafeRawAnswerEcho: "DO_NOT_RENDER_RAW_ANSWER",
          unsafeProviderPayloadEcho: "DO_NOT_RENDER_PROVIDER_PAYLOAD",
        },
        audit: {
          actionType:
            "personal_ai_generation_result.formal_adoption_review.approve",
          targetResourceType: "personal_ai_generation_result",
          targetPublicId: "personal_ai_result_public_admin_901",
          redactionStatus: "redacted",
        },
      },
    },
  };
}

function mockFetchWithResponse(responseBody: unknown) {
  const fetchMock = vi.fn(async () => {
    return {
      json: async () => responseBody,
    } as Response;
  });

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("AdminAiAuditLogOpsBaseline formal adoption review affordance", () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    localStorage.setItem("tiku.localSessionToken", "admin-session-token");
  });

  it("renders a metadata-only formal adoption review entry with blocked write semantics", () => {
    render(<AdminAiAuditLogOpsBaseline />);

    expect(screen.getByText("正式入库复核")).toBeInTheDocument();
    expect(screen.getByText("metadata-only")).toBeInTheDocument();
    expect(screen.getAllByText("redacted").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("blocked_without_follow_up_task").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: "提交元数据复核" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_result_public_admin_901"),
    ).not.toBeInTheDocument();
  });

  it("renders the loading state while the formal adoption review request is pending", async () => {
    mockFetchWithResponse(new Promise(() => {}));

    render(<AdminAiAuditLogOpsBaseline />);

    fireEvent.click(screen.getByRole("button", { name: "提交元数据复核" }));

    expect(await screen.findByText("正式入库复核提交中")).toBeInTheDocument();
  });

  it("renders an error state without leaking session or public identifiers", async () => {
    mockFetchWithResponse({
      code: 409177,
      message: "Personal AI generation result is not eligible.",
      data: null,
    });

    render(<AdminAiAuditLogOpsBaseline />);

    fireEvent.click(screen.getByRole("button", { name: "提交元数据复核" }));

    expect(await screen.findByText("正式入库复核暂不可用")).toBeInTheDocument();
    expect(screen.queryByText("admin-session-token")).not.toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_result_public_admin_901"),
    ).not.toBeInTheDocument();
  });

  it("submits the existing formal adoption review contract and renders redacted success metadata", async () => {
    const fetchMock = mockFetchWithResponse(
      createFormalAdoptionReviewResponse(),
    );

    render(<AdminAiAuditLogOpsBaseline />);

    fireEvent.click(screen.getByRole("button", { name: "提交元数据复核" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/personal-ai-generation-results/personal_ai_result_public_admin_901/formal-adoption-reviews",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });
    expect(
      await screen.findByText("approved_for_manual_adoption"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("blocked_without_follow_up_task").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("redacted").length).toBeGreaterThan(0);
    expect(screen.getByText("metadata-only")).toBeInTheDocument();
  });

  it("does not render raw prompts, raw answers, provider payloads, or public identifier lists from review success data", async () => {
    mockFetchWithResponse(createFormalAdoptionReviewResponse());

    render(<AdminAiAuditLogOpsBaseline />);

    fireEvent.click(screen.getByRole("button", { name: "提交元数据复核" }));

    await screen.findByText("approved_for_manual_adoption");
    expect(
      screen.queryByText("DO_NOT_RENDER_RAW_PROMPT"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("DO_NOT_RENDER_RAW_ANSWER"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("DO_NOT_RENDER_PROVIDER_PAYLOAD"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("personal_ai_result_public_admin_901"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_generation_task_public_admin_901"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("ai_call_log_public_admin_901"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("admin-session-token")).not.toBeInTheDocument();
  });
});
