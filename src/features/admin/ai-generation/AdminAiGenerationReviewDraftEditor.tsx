"use client";

import { useState } from "react";

import type {
  AdminAiGenerationFormalPaperDraftPayload,
  AdminAiGenerationFormalQuestionDraftPayload,
  AdminAiGenerationFormalReviewedDraftPayload,
} from "@/server/contracts/admin-ai-generation-formal-draft-adapter-contract";
import {
  ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES,
  type AdminAiGenerationReviewDraftDto,
} from "@/server/contracts/admin-ai-generation-review-draft-contract";

import {
  fetchAdminApi,
  getStoredSessionToken,
  isUnauthorizedResponse,
} from "../content-admin-runtime";

type ReviewEditorState =
  | "closed"
  | "loading"
  | "ready"
  | "saving"
  | "saved"
  | "legacy"
  | "conflict"
  | "error";

type ReviewDraftTargetType = "question" | "paper";

const controlClassName =
  "border-border bg-background text-text-primary mt-1 w-full rounded-md border px-3 py-2 text-sm";

const questionDifficultyOptions = ["easy", "medium", "hard"] as const;

export function AdminAiGenerationReviewDraftEditor({
  resultPublicId,
  targetType,
  onRevisionChange,
}: {
  resultPublicId: string;
  targetType: ReviewDraftTargetType;
  onRevisionChange: (revision: AdminAiGenerationReviewDraftDto | null) => void;
}) {
  const [state, setState] = useState<ReviewEditorState>("closed");
  const [revision, setRevision] =
    useState<AdminAiGenerationReviewDraftDto | null>(null);
  const [draft, setDraft] =
    useState<AdminAiGenerationFormalReviewedDraftPayload | null>(null);

  const reviewDraftPath = `/api/v1/content-ai-generation-results/${encodeURIComponent(resultPublicId)}/review-drafts`;

  async function loadCurrentRevision() {
    setState("loading");
    setRevision(null);
    setDraft(null);
    onRevisionChange(null);

    try {
      const response = await fetchAdminApi<AdminAiGenerationReviewDraftDto>(
        reviewDraftPath,
        getStoredSessionToken(),
        { cache: "no-store", method: "GET" },
      );

      if (
        isUnauthorizedResponse(response) ||
        response.code !== 0 ||
        response.data === null ||
        response.data.resultPublicId !== resultPublicId ||
        response.data.targetType !== targetType
      ) {
        setState("error");
        return;
      }

      if (
        response.data.status !== "versioned" ||
        response.data.currentRevision === null ||
        response.data.currentDraftDigest === undefined ||
        response.data.reviewedDraft === undefined
      ) {
        setState("legacy");
        return;
      }

      setRevision(response.data);
      setDraft(response.data.reviewedDraft);
      setState("ready");
      onRevisionChange(response.data);
    } catch {
      setState("error");
    }
  }

  async function saveNewRevision() {
    if (
      revision === null ||
      revision.currentRevision === null ||
      revision.currentDraftDigest === undefined ||
      draft === null
    ) {
      return;
    }

    setState("saving");
    onRevisionChange(null);

    try {
      const response = await fetchAdminApi<AdminAiGenerationReviewDraftDto>(
        reviewDraftPath,
        getStoredSessionToken(),
        {
          body: JSON.stringify({
            expectedRevision: revision.currentRevision,
            expectedDraftDigest: revision.currentDraftDigest,
            targetType,
            reviewedDraft: draft,
          }),
          headers: { "content-type": "application/json" },
          method: "PUT",
        },
      );

      if (
        response.code === ADMIN_AI_GENERATION_REVIEW_DRAFT_ERROR_CODES.conflict
      ) {
        setRevision(null);
        onRevisionChange(null);
        setState("conflict");
        return;
      }

      if (
        isUnauthorizedResponse(response) ||
        response.code !== 0 ||
        response.data === null ||
        response.data.status !== "versioned" ||
        response.data.resultPublicId !== resultPublicId ||
        response.data.targetType !== targetType ||
        response.data.currentRevision === null ||
        response.data.currentDraftDigest === undefined ||
        response.data.reviewedDraft === undefined
      ) {
        setState("error");
        return;
      }

      setRevision(response.data);
      setDraft(response.data.reviewedDraft);
      setState("saved");
      onRevisionChange(response.data);
    } catch {
      setState("error");
    }
  }

  function handleDraftChange(
    nextDraft: AdminAiGenerationFormalReviewedDraftPayload,
  ) {
    setDraft(nextDraft);
    setState("ready");
    onRevisionChange(null);
  }

  if (state === "closed") {
    return (
      <button
        className="border-border text-text-primary mt-3 inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium"
        type="button"
        onClick={() => void loadCurrentRevision()}
      >
        打开评审草稿
      </button>
    );
  }

  if (state === "loading") {
    return (
      <p className="text-text-secondary mt-3 text-sm" role="status">
        正在加载当前服务器修订
      </p>
    );
  }

  if (state === "legacy") {
    return (
      <div className="mt-3">
        <p className="text-text-secondary text-sm" role="status">
          该历史结果没有可验证的版本化草稿，不能从摘要伪造评审内容。
        </p>
        <ReloadButton onReload={loadCurrentRevision} />
      </div>
    );
  }

  if (state === "conflict") {
    return (
      <div className="mt-3">
        <p className="text-destructive text-sm" role="alert">
          服务器修订已变化，请重新加载后再编辑。
        </p>
        <ReloadButton label="重新加载评审草稿" onReload={loadCurrentRevision} />
      </div>
    );
  }

  if (state === "error" || revision === null || draft === null) {
    return (
      <div className="mt-3">
        <p className="text-destructive text-sm" role="alert">
          评审草稿暂不可用，未开放采纳或驳回。
        </p>
        <ReloadButton label="重新加载评审草稿" onReload={loadCurrentRevision} />
      </div>
    );
  }

  return (
    <section
      className="border-border bg-muted/40 mt-3 rounded-md border p-3"
      data-testid="content-admin-review-draft-editor"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-brand-primary text-xs font-medium">
            结构化评审草稿
          </p>
          <h5 className="text-text-primary mt-1 text-sm font-semibold">
            当前修订：{revision.currentRevision}
          </h5>
        </div>
        <button
          className="border-border text-text-secondary inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium"
          disabled={state === "saving"}
          type="button"
          onClick={() => void loadCurrentRevision()}
        >
          重新加载
        </button>
      </div>

      <fieldset disabled={state === "saving"}>
        {isQuestionDraft(draft) ? (
          <QuestionDraftFields draft={draft} onChange={handleDraftChange} />
        ) : (
          <PaperDraftFields draft={draft} onChange={handleDraftChange} />
        )}
      </fieldset>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="bg-brand-primary text-on-primary inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          disabled={state === "saving"}
          type="button"
          onClick={() => void saveNewRevision()}
        >
          {state === "saving" ? "正在保存" : "保存新修订"}
        </button>
        {state === "saved" ? (
          <span className="text-brand-primary text-xs" role="status">
            新修订已保存；后续采纳将绑定该修订。
          </span>
        ) : null}
      </div>
    </section>
  );
}

function QuestionDraftFields({
  draft,
  onChange,
}: {
  draft: AdminAiGenerationFormalQuestionDraftPayload;
  onChange: (draft: AdminAiGenerationFormalQuestionDraftPayload) => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-text-secondary text-xs font-medium">
          题型
          <input
            className={controlClassName}
            disabled
            value={draft.questionType}
          />
        </label>
        <label className="text-text-secondary text-xs font-medium">
          难度
          <select
            aria-label="难度"
            className={controlClassName}
            value={draft.difficulty}
            onChange={(event) =>
              onChange({
                ...draft,
                difficulty: event.currentTarget
                  .value as typeof draft.difficulty,
              })
            }
          >
            {questionDifficultyOptions.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </label>
      </div>
      <DraftTextarea
        label="题干"
        value={draft.stemRichText}
        onChange={(stemRichText) => onChange({ ...draft, stemRichText })}
      />
      <DraftTextarea
        label="标准答案"
        value={draft.standardAnswerRichText}
        onChange={(standardAnswerRichText) =>
          onChange({ ...draft, standardAnswerRichText })
        }
      />
      <DraftTextarea
        label="解析"
        value={draft.analysisRichText}
        onChange={(analysisRichText) =>
          onChange({ ...draft, analysisRichText })
        }
      />
      {draft.questionOptions.map((questionOption, index) => (
        <DraftTextarea
          key={`${questionOption.label}:${questionOption.sortOrder}`}
          label={`选项 ${questionOption.label}`}
          value={questionOption.contentRichText}
          onChange={(contentRichText) =>
            onChange({
              ...draft,
              questionOptions: draft.questionOptions.map(
                (candidate, candidateIndex) =>
                  candidateIndex === index
                    ? { ...candidate, contentRichText }
                    : candidate,
              ),
            })
          }
        />
      ))}
      {draft.scoringPoints.map((scoringPoint, index) => (
        <DraftTextarea
          key={scoringPoint.sortOrder}
          label={`评分点 ${scoringPoint.sortOrder}`}
          value={scoringPoint.description}
          onChange={(description) =>
            onChange({
              ...draft,
              scoringPoints: draft.scoringPoints.map(
                (candidate, candidateIndex) =>
                  candidateIndex === index
                    ? { ...candidate, description }
                    : candidate,
              ),
            })
          }
        />
      ))}
      {draft.fillBlankAnswers.map((fillBlankAnswer, index) => (
        <DraftTextarea
          key={`${fillBlankAnswer.blankKey}:${fillBlankAnswer.sortOrder}`}
          label={`填空答案 ${fillBlankAnswer.blankKey}`}
          value={fillBlankAnswer.standardAnswers.join("\n")}
          onChange={(standardAnswers) =>
            onChange({
              ...draft,
              fillBlankAnswers: draft.fillBlankAnswers.map(
                (candidate, candidateIndex) =>
                  candidateIndex === index
                    ? {
                        ...candidate,
                        standardAnswers: standardAnswers
                          .split("\n")
                          .map((answer) => answer.trim())
                          .filter((answer) => answer.length > 0),
                      }
                    : candidate,
              ),
            })
          }
        />
      ))}
      <p className="text-text-secondary text-xs">
        知识点、标签、题型与评分合同保持服务器当前修订；保存时仍由服务端完整校验。
      </p>
    </div>
  );
}

function PaperDraftFields({
  draft,
  onChange,
}: {
  draft: AdminAiGenerationFormalPaperDraftPayload;
  onChange: (draft: AdminAiGenerationFormalPaperDraftPayload) => void;
}) {
  return (
    <div className="mt-3 space-y-3">
      <DraftInput
        label="试卷名称"
        value={draft.name}
        onChange={(name) => onChange({ ...draft, name })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <DraftOptionalInput
          label="来源说明"
          value={draft.sourceDescription}
          onChange={(sourceDescription) =>
            onChange({ ...draft, sourceDescription })
          }
        />
        <DraftOptionalInput
          label="出题依据"
          value={draft.questionBasis}
          onChange={(questionBasis) => onChange({ ...draft, questionBasis })}
        />
        <DraftOptionalInput
          label="来源地区"
          value={draft.sourceRegion}
          onChange={(sourceRegion) => onChange({ ...draft, sourceRegion })}
        />
        <DraftOptionalInput
          label="来源机构"
          value={draft.sourceOrganization}
          onChange={(sourceOrganization) =>
            onChange({ ...draft, sourceOrganization })
          }
        />
      </div>
      {(draft.paperSections ?? []).map((paperSection, paperSectionIndex) => (
        <fieldset
          className="border-border rounded-md border p-3"
          key={paperSection.sortOrder}
        >
          <legend className="text-text-primary px-1 text-xs font-semibold">
            大题 {paperSection.sortOrder}
          </legend>
          <DraftInput
            label={`大题 ${paperSection.sortOrder} 标题`}
            value={paperSection.title}
            onChange={(title) =>
              onChange({
                ...draft,
                paperSections: (draft.paperSections ?? []).map(
                  (candidate, candidateIndex) =>
                    candidateIndex === paperSectionIndex
                      ? { ...candidate, title }
                      : candidate,
                ),
              })
            }
          />
          {paperSection.paperQuestions.map((paperQuestion, questionIndex) => (
            <DraftInput
              key={`${paperQuestion.questionPublicId}:${paperQuestion.sortOrder}`}
              label={`第 ${paperQuestion.sortOrder} 题分值`}
              value={paperQuestion.score}
              onChange={(score) =>
                onChange({
                  ...draft,
                  paperSections: (draft.paperSections ?? []).map(
                    (candidate, candidateIndex) =>
                      candidateIndex === paperSectionIndex
                        ? {
                            ...candidate,
                            paperQuestions: candidate.paperQuestions.map(
                              (questionCandidate, questionCandidateIndex) =>
                                questionCandidateIndex === questionIndex
                                  ? { ...questionCandidate, score }
                                  : questionCandidate,
                            ),
                          }
                        : candidate,
                  ),
                })
              }
            />
          ))}
        </fieldset>
      ))}
      <p className="text-text-secondary text-xs">
        题目身份、顺序、题组和来源合同保持服务器当前修订；客户端不生成内部身份。
      </p>
    </div>
  );
}

function DraftInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-text-secondary block text-xs font-medium">
      {label}
      <input
        aria-label={label}
        className={controlClassName}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function DraftOptionalInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  return (
    <DraftInput
      label={label}
      value={value ?? ""}
      onChange={(nextValue) =>
        onChange(nextValue.trim() === "" ? null : nextValue)
      }
    />
  );
}

function DraftTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-text-secondary block text-xs font-medium">
      {label}
      <textarea
        aria-label={label}
        className={`${controlClassName} min-h-20`}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}

function ReloadButton({
  label = "重试加载",
  onReload,
}: {
  label?: string;
  onReload: () => Promise<void>;
}) {
  return (
    <button
      className="border-border text-text-primary mt-2 inline-flex h-8 items-center justify-center rounded-md border px-3 text-xs font-medium"
      type="button"
      onClick={() => void onReload()}
    >
      {label}
    </button>
  );
}

function isQuestionDraft(
  draft: AdminAiGenerationFormalReviewedDraftPayload,
): draft is AdminAiGenerationFormalQuestionDraftPayload {
  return "questionType" in draft;
}
