"use client";

import {
  AlertCircle,
  Eye,
  History,
  Loader2,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  fetchCurrentStudentSession,
  fetchPersonalAiGenerationRequestHistory,
  fetchStudentApi,
  getStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import type { PersonalAiGenerationLocalBrowserExperienceDto } from "@/server/contracts/personal-ai-generation-local-browser-experience-contract";
import type { PersonalAiGenerationRequestHistoryDto } from "@/server/contracts/personal-ai-generation-request-history-contract";
import type {
  PersonalAiGenerationResultDetailDto,
  PersonalAiGenerationResultHistoryDto,
} from "@/server/contracts/personal-ai-generation-result-history-contract";
import type { PersonalAiGenerationFuncType } from "@/server/models/personal-ai-generation-request";

type StudentPersonalAiGenerationPageState =
  | "empty"
  | "loading"
  | "ready"
  | "error"
  | "unauthorized";

type StudentPersonalAiGenerationHistoryState =
  | "empty"
  | "loading"
  | "ready"
  | "error"
  | "unauthorized";

type StudentPersonalAiGenerationResultDetailState =
  | "idle"
  | StudentPersonalAiGenerationHistoryState;

type StudentPersonalAiGenerationRequestDraft = {
  userPublicId: string;
  requestPublicId: string;
  authorizationPublicId: string;
  aiFuncType: PersonalAiGenerationFuncType;
  questionPublicId: string;
  answerRecordPublicId: string | null;
  paperPublicId: string | null;
  mockExamPublicId: string | null;
  redeemCodePublicId: string | null;
  auditLogPublicId: string | null;
  aiCallLogPublicId: string | null;
  taskPublicId: string;
  taskType: "ai_question_generation";
  actorPublicId: string;
  authorizationSource: "personal_auth";
  ownerType: "personal";
  ownerPublicId: string;
  organizationPublicId: null;
  quotaOwnerType: "personal";
  quotaOwnerPublicId: string;
  effectiveEdition: "advanced";
  isAuthorizationActive: boolean;
  isScopeAllowed: boolean;
  isQuotaAvailable: boolean;
  isRuntimeConfigReady: boolean;
  idempotencyKeyHash: string;
  existingTaskPublicId: string | null;
  existingTaskStatus: string | null;
  resultPublicId: string | null;
  evidenceStatus: "sufficient" | "weak" | "none";
  citationCount: number;
};

const copy = {
  title: "\u4e2a\u4eba AI \u5b66\u4e60",
  subtitle:
    "\u4ece\u5b66\u5458\u7aef\u53d1\u8d77\u672c\u5730\u5408\u7ea6\u8bf7\u6c42\uff0c\u4ec5\u5c55\u793a\u6458\u8981\u548c\u516c\u5f00\u6807\u8bc6\u3002",
  emptyTitle: "\u5c1a\u672a\u63d0\u4ea4\u672c\u5730\u8bf7\u6c42",
  emptyDescription:
    "\u70b9\u51fb\u6309\u94ae\u540e\uff0c\u9875\u9762\u4f1a\u8bf7\u6c42\u672c\u5730 route contract \u5e76\u5448\u73b0\u8fd4\u56de\u6458\u8981\u3002",
  requestButton: "\u53d1\u8d77\u672c\u5730 AI \u8bf7\u6c42",
  loadingTitle: "\u6b63\u5728\u53d1\u8d77\u672c\u5730\u8bf7\u6c42",
  errorTitle: "\u672c\u5730 AI \u8bf7\u6c42\u5931\u8d25",
  errorDescription:
    "\u8bf7\u7a0d\u540e\u5237\u65b0\u9875\u9762\u6216\u91cd\u65b0\u767b\u5f55\u540e\u518d\u5c1d\u8bd5\u3002",
  unauthorizedTitle: "\u8bf7\u5148\u767b\u5f55",
  unauthorizedDescription:
    "\u4e2a\u4eba AI \u5b66\u4e60\u9700\u8981\u6709\u6548\u7684\u5b66\u5458\u4f1a\u8bdd\u3002",
  blockedTitle: "\u8bf7\u6c42\u5df2\u963b\u65ad",
  contractTitle: "\u672c\u5730\u5408\u7ea6\u6458\u8981",
  historyTitle: "\u8fd1\u671f AI \u8bf7\u6c42\u5386\u53f2",
  historyEmptyTitle: "\u6682\u65e0\u5386\u53f2\u8bf7\u6c42",
  historyLoadingTitle: "\u5386\u53f2\u8bf7\u6c42\u540c\u6b65\u4e2d",
  historyErrorTitle: "\u5386\u53f2\u8bf7\u6c42\u6682\u4e0d\u53ef\u7528",
  historyUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u8bf7\u6c42\u5386\u53f2",
  resultHistoryTitle: "\u8fd1\u671f AI \u7ed3\u679c\u5386\u53f2",
  resultHistoryEmptyTitle: "\u6682\u65e0\u5386\u53f2\u7ed3\u679c",
  resultHistoryLoadingTitle: "\u7ed3\u679c\u5386\u53f2\u540c\u6b65\u4e2d",
  resultHistoryErrorTitle: "\u7ed3\u679c\u5386\u53f2\u6682\u4e0d\u53ef\u7528",
  resultHistoryUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u7ed3\u679c\u5386\u53f2",
  resultDetailTitle: "\u8131\u654f\u7ed3\u679c\u8be6\u60c5",
  resultDetailButton: "\u67e5\u770b\u8131\u654f\u8be6\u60c5",
  resultDetailLoadingTitle: "\u7ed3\u679c\u8be6\u60c5\u540c\u6b65\u4e2d",
  resultDetailEmptyTitle:
    "\u7ed3\u679c\u8be6\u60c5\u6682\u65e0\u53ef\u7528\u8131\u654f\u5feb\u7167",
  resultDetailErrorTitle: "\u7ed3\u679c\u8be6\u60c5\u6682\u4e0d\u53ef\u7528",
  resultDetailUnauthorizedTitle:
    "\u767b\u5f55\u540e\u67e5\u770b\u7ed3\u679c\u8be6\u60c5",
};

const personalAiGenerationRequestDraft: StudentPersonalAiGenerationRequestDraft =
  {
    userPublicId: "student-public-001",
    requestPublicId: "personal-ai-request-public-001",
    authorizationPublicId: "personal-auth-public-001",
    aiFuncType: "explanation",
    questionPublicId: "question-public-001",
    answerRecordPublicId: "answer-record-public-001",
    paperPublicId: "paper-public-001",
    mockExamPublicId: null,
    redeemCodePublicId: null,
    auditLogPublicId: null,
    aiCallLogPublicId: null,
    taskPublicId: "ai-generation-task-public-001",
    taskType: "ai_question_generation",
    actorPublicId: "student-public-001",
    authorizationSource: "personal_auth",
    ownerType: "personal",
    ownerPublicId: "student-public-001",
    organizationPublicId: null,
    quotaOwnerType: "personal",
    quotaOwnerPublicId: "student-public-001",
    effectiveEdition: "advanced",
    isAuthorizationActive: true,
    isScopeAllowed: true,
    isQuotaAvailable: true,
    isRuntimeConfigReady: true,
    idempotencyKeyHash: "sha256:student-local-request",
    existingTaskPublicId: null,
    existingTaskStatus: null,
    resultPublicId: null,
    evidenceStatus: "none",
    citationCount: 0,
  };

let personalAiGenerationRequestSequence = 0;

function createPersonalAiGenerationRequestUniqueSuffix(): string {
  personalAiGenerationRequestSequence += 1;

  const sequenceSegment = personalAiGenerationRequestSequence.toString(36);
  const timeSegment = Date.now().toString(36);
  const randomSegment =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${timeSegment}-${sequenceSegment}`;

  return `${timeSegment}-${sequenceSegment}-${randomSegment}`;
}

function createPersonalAiGenerationRequestIdentifiers() {
  const uniqueSuffix = createPersonalAiGenerationRequestUniqueSuffix();

  return {
    requestPublicId: `personal-ai-request-public-${uniqueSuffix}`,
    taskPublicId: `ai-generation-task-public-${uniqueSuffix}`,
    idempotencyKeyHash: `sha256:student-local-request-${uniqueSuffix}`,
  };
}

function readHasStudentSessionToken(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return getStoredStudentSessionToken() !== null;
}

function createPersonalAiGenerationRequestBody(
  draft: StudentPersonalAiGenerationRequestDraft,
  userPublicId: string,
) {
  return {
    responseMode: "local_browser_experience",
    ...draft,
    ...createPersonalAiGenerationRequestIdentifiers(),
    userPublicId,
    actorPublicId: userPublicId,
    ownerPublicId: userPublicId,
    quotaOwnerPublicId: userPublicId,
  };
}

function formatNullableText(value: string | null | undefined): string {
  return value ?? "null";
}

async function fetchPersonalAiGenerationResultHistory(
  studentSessionValue: string,
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationResultHistoryDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationResultHistoryDto>(
    "/api/v1/personal-ai-generation-results",
    studentSessionValue,
    {
      method: "GET",
    },
  );
}

async function fetchPersonalAiGenerationResultDetail(
  studentSessionValue: string,
  resultPublicId: string,
): Promise<{
  code: number;
  message: string;
  data: PersonalAiGenerationResultDetailDto | null;
}> {
  return fetchStudentApi<PersonalAiGenerationResultDetailDto>(
    `/api/v1/personal-ai-generation-results/${encodeURIComponent(
      resultPublicId,
    )}`,
    studentSessionValue,
    {
      method: "GET",
    },
  );
}

function StudentPersonalAiGenerationStateMessage({
  title,
  description,
  tone = "neutral",
}: {
  title: string;
  description: string;
  tone?: "neutral" | "warning";
}) {
  const Icon = tone === "warning" ? ShieldAlert : AlertCircle;

  return (
    <section className="border-border bg-surface flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-start gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="font-heading text-text-primary text-base font-semibold">
            {title}
          </h2>
          <p className="text-text-secondary text-sm leading-6">{description}</p>
        </div>
      </div>
    </section>
  );
}

function ContractField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <dt className="text-text-secondary text-sm">{label}</dt>
      <dd className="text-text-primary max-w-[12rem] truncate text-right text-sm font-medium">
        {value}
      </dd>
    </div>
  );
}

function StudentPersonalAiGenerationContractSummary({
  experience,
}: {
  experience: PersonalAiGenerationLocalBrowserExperienceDto;
}) {
  const disabledReason = experience.requestState.action.disabledReason;
  const resultReference = experience.requestFlow.resultReference;

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.contractTitle}
        </h2>
        <span className="bg-secondary text-secondary-foreground rounded-lg px-2 py-1 text-xs font-medium">
          {experience.redactionStatus}
        </span>
      </div>

      {experience.requestState.status === "blocked" ? (
        <div className="bg-warning/10 text-warning mb-3 rounded-lg px-3 py-2 text-sm">
          <strong className="font-semibold">{copy.blockedTitle}</strong>
          <span className="ml-2">{disabledReason ?? "unknown"}</span>
        </div>
      ) : null}

      <dl>
        <ContractField label="runtimeStatus" value={experience.runtimeStatus} />
        <ContractField
          label="experienceSurface"
          value={experience.experienceSurface}
        />
        <ContractField label="flowStatus" value={experience.flowStatus} />
        <ContractField
          label="contextPublicId"
          value={
            experience.requestState.selectedContext.contextPublicId ?? "null"
          }
        />
        <ContractField
          label="resultStatus"
          value={experience.resultState.status}
        />
        <ContractField
          label="contentVisibility"
          value={experience.resultState.contentVisibility}
        />
        <ContractField
          label="isFormalAdoptionBlocked"
          value={String(experience.resultState.isFormalAdoptionBlocked)}
        />
        <ContractField
          label="taskPublicId"
          value={resultReference.taskPublicId}
        />
        <ContractField
          label="resultPublicId"
          value={formatNullableText(
            resultReference.resultReference.resultPublicId,
          )}
        />
        <ContractField
          label="aiCallLogPublicId"
          value={formatNullableText(
            resultReference.aiCallLogReference.aiCallLogPublicId,
          )}
        />
        <ContractField
          label="evidenceStatus"
          value={resultReference.resultReference.evidenceStatus}
        />
        <ContractField
          label="citationCount"
          value={String(resultReference.resultReference.citationCount)}
        />
        <ContractField
          label="referenceRedactionStatus"
          value={resultReference.resultReference.redactionStatus}
        />
      </dl>
    </section>
  );
}

function StudentPersonalAiGenerationHistorySummary({
  historyState,
  historyRows,
}: {
  historyState: StudentPersonalAiGenerationHistoryState;
  historyRows: PersonalAiGenerationRequestHistoryDto;
}) {
  function renderHistoryBody() {
    if (historyState === "loading") {
      return (
        <div className="flex items-center gap-3 py-3">
          <Loader2
            className="text-brand-primary size-5 animate-spin"
            aria-hidden="true"
          />
          <p className="text-text-primary text-sm font-medium">
            {copy.historyLoadingTitle}
          </p>
        </div>
      );
    }

    if (historyState === "unauthorized") {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.historyUnauthorizedTitle}
        </p>
      );
    }

    if (historyState === "error") {
      return (
        <p className="text-warning bg-warning/10 rounded-lg px-3 py-3 text-sm font-medium">
          {copy.historyErrorTitle}
        </p>
      );
    }

    if (historyRows.length === 0) {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.historyEmptyTitle}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {historyRows.map((historyRow) => (
          <article
            key={historyRow.requestPublicId}
            className="border-border rounded-lg border px-3"
          >
            <dl>
              <ContractField
                label="requestPublicId"
                value={historyRow.requestPublicId}
              />
              <ContractField
                label="taskPublicId"
                value={historyRow.taskPublicId}
              />
              <ContractField label="status" value={historyRow.status} />
              <ContractField
                label="requestedAt"
                value={historyRow.requestedAt}
              />
              <ContractField
                label="resultPublicId"
                value={formatNullableText(historyRow.resultPublicId)}
              />
              <ContractField
                label="evidenceStatus"
                value={historyRow.evidenceStatus}
              />
              <ContractField
                label="citationCount"
                value={String(historyRow.citationCount)}
              />
              <ContractField
                label="aiCallLogPublicId"
                value={formatNullableText(historyRow.aiCallLogPublicId)}
              />
              <ContractField
                label="redactionStatus"
                value={historyRow.redactionStatus}
              />
            </dl>
          </article>
        ))}
      </div>
    );
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <History className="size-4" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.historyTitle}
        </h2>
      </div>
      {renderHistoryBody()}
    </section>
  );
}

function StudentPersonalAiGenerationResultHistorySummary({
  resultHistoryState,
  resultHistory,
  isResultDetailLoading,
  onOpenResultDetail,
  selectedResultPublicId,
}: {
  resultHistoryState: StudentPersonalAiGenerationHistoryState;
  resultHistory: PersonalAiGenerationResultHistoryDto | null;
  isResultDetailLoading: boolean;
  onOpenResultDetail: (resultPublicId: string) => void;
  selectedResultPublicId: string | null;
}) {
  function renderResultHistoryBody() {
    if (resultHistoryState === "loading") {
      return (
        <div className="flex items-center gap-3 py-3">
          <Loader2
            className="text-brand-primary size-5 animate-spin"
            aria-hidden="true"
          />
          <p className="text-text-primary text-sm font-medium">
            {copy.resultHistoryLoadingTitle}
          </p>
        </div>
      );
    }

    if (resultHistoryState === "unauthorized") {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultHistoryUnauthorizedTitle}
        </p>
      );
    }

    if (resultHistoryState === "error") {
      return (
        <p className="text-warning bg-warning/10 rounded-lg px-3 py-3 text-sm font-medium">
          {copy.resultHistoryErrorTitle}
        </p>
      );
    }

    if (resultHistory === null || resultHistory.results.length === 0) {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultHistoryEmptyTitle}
        </p>
      );
    }

    return (
      <div className="space-y-3">
        <dl className="border-border rounded-lg border px-3">
          <ContractField
            label="runtimeStatus"
            value={resultHistory.runtimeStatus}
          />
          <ContractField
            label="contentVisibility"
            value={resultHistory.contentVisibility}
          />
          <ContractField
            label="redactionStatus"
            value={resultHistory.redactionStatus}
          />
          <ContractField
            label="formalAdoptionWriteStatus"
            value={resultHistory.formalAdoptionWriteStatus}
          />
        </dl>

        {resultHistory.results.map((resultRow) => (
          <article
            key={resultRow.resultPublicId}
            className="border-border rounded-lg border px-3"
          >
            <dl>
              <ContractField
                label="resultPublicId"
                value={resultRow.resultPublicId}
              />
              <ContractField
                label="taskPublicId"
                value={resultRow.taskPublicId}
              />
              <ContractField
                label="requestPublicId"
                value={resultRow.requestPublicId}
              />
              <ContractField label="taskType" value={resultRow.taskType} />
              <ContractField label="status" value={resultRow.status} />
              <ContractField
                label="persistedAt"
                value={resultRow.persistedAt}
              />
              <ContractField
                label="contentDigest"
                value={resultRow.contentReference.contentDigest}
              />
              <ContractField
                label="contentPreviewMasked"
                value={resultRow.contentReference.contentPreviewMasked}
              />
              <ContractField
                label="evidenceStatus"
                value={resultRow.evidenceReference.evidenceStatus}
              />
              <ContractField
                label="citationCount"
                value={String(resultRow.evidenceReference.citationCount)}
              />
              <ContractField
                label="aiCallLogPublicId"
                value={formatNullableText(
                  resultRow.evidenceReference.aiCallLogPublicId,
                )}
              />
              <ContractField
                label="formalAdoptionStatus"
                value={resultRow.formalAdoption.status}
              />
            </dl>
            <div className="border-border flex justify-end border-t py-3">
              <button
                type="button"
                disabled={
                  isResultDetailLoading &&
                  selectedResultPublicId === resultRow.resultPublicId
                }
                onClick={() => onOpenResultDetail(resultRow.resultPublicId)}
                className="bg-secondary text-secondary-foreground flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResultDetailLoading &&
                selectedResultPublicId === resultRow.resultPublicId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
                {copy.resultDetailButton}
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <History className="size-4" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.resultHistoryTitle}
        </h2>
      </div>
      {renderResultHistoryBody()}
    </section>
  );
}

function StudentPersonalAiGenerationResultDetailSummary({
  resultDetailState,
  resultDetail,
}: {
  resultDetailState: StudentPersonalAiGenerationResultDetailState;
  resultDetail: PersonalAiGenerationResultDetailDto | null;
}) {
  if (resultDetailState === "idle") {
    return null;
  }

  function renderResultDetailBody() {
    if (resultDetailState === "loading") {
      return (
        <div className="flex items-center gap-3 py-3">
          <Loader2
            className="text-brand-primary size-5 animate-spin"
            aria-hidden="true"
          />
          <p className="text-text-primary text-sm font-medium">
            {copy.resultDetailLoadingTitle}
          </p>
        </div>
      );
    }

    if (resultDetailState === "unauthorized") {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultDetailUnauthorizedTitle}
        </p>
      );
    }

    if (resultDetailState === "error") {
      return (
        <p className="text-warning bg-warning/10 rounded-lg px-3 py-3 text-sm font-medium">
          {copy.resultDetailErrorTitle}
        </p>
      );
    }

    if (resultDetailState === "empty" || resultDetail === null) {
      return (
        <p className="text-text-secondary border-border rounded-lg border border-dashed px-3 py-3 text-sm">
          {copy.resultDetailEmptyTitle}
        </p>
      );
    }

    return (
      <dl className="border-border rounded-lg border px-3">
        <ContractField
          label="runtimeStatus"
          value={resultDetail.runtimeStatus}
        />
        <ContractField label="detailDisplayMode" value="metadata_only" />
        <ContractField
          label="contentVisibility"
          value={resultDetail.contentVisibility}
        />
        <ContractField
          label="redactionStatus"
          value={resultDetail.redactionStatus}
        />
        <ContractField
          label="formalAdoptionWriteStatus"
          value={resultDetail.formalAdoptionWriteStatus}
        />
        <ContractField
          label="resultPublicId"
          value={resultDetail.result.resultPublicId}
        />
        <ContractField
          label="taskPublicId"
          value={resultDetail.result.taskPublicId}
        />
        <ContractField
          label="requestPublicId"
          value={resultDetail.result.requestPublicId}
        />
        <ContractField label="taskType" value={resultDetail.result.taskType} />
        <ContractField label="status" value={resultDetail.result.status} />
        <ContractField
          label="persistedAt"
          value={resultDetail.result.persistedAt}
        />
        <ContractField
          label="contentDigest"
          value={resultDetail.result.contentReference.contentDigest}
        />
        <ContractField
          label="contentPreviewMasked"
          value={resultDetail.result.contentReference.contentPreviewMasked}
        />
        <ContractField
          label="contentReferenceVisibility"
          value={resultDetail.result.contentReference.contentVisibility}
        />
        <ContractField
          label="contentReferenceRedactionStatus"
          value={resultDetail.result.contentReference.redactionStatus}
        />
        <ContractField
          label="evidenceStatus"
          value={resultDetail.result.evidenceReference.evidenceStatus}
        />
        <ContractField
          label="citationCount"
          value={String(resultDetail.result.evidenceReference.citationCount)}
        />
        <ContractField
          label="aiCallLogPublicId"
          value={formatNullableText(
            resultDetail.result.evidenceReference.aiCallLogPublicId,
          )}
        />
        <ContractField
          label="formalAdoptionStatus"
          value={resultDetail.result.formalAdoption.status}
        />
        <ContractField
          label="isFormalAdoptionBlocked"
          value={String(resultDetail.result.formalAdoption.isBlocked)}
        />
      </dl>
    );
  }

  return (
    <section className="border-border bg-surface rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="bg-secondary text-secondary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Eye className="size-4" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-text-primary text-base font-semibold">
          {copy.resultDetailTitle}
        </h2>
      </div>
      {renderResultDetailBody()}
    </section>
  );
}

export function StudentPersonalAiGenerationPage() {
  const [hasSessionToken, setHasSessionToken] = useState(
    readHasStudentSessionToken,
  );
  const [pageState, setPageState] =
    useState<StudentPersonalAiGenerationPageState>(
      hasSessionToken ? "empty" : "unauthorized",
    );
  const [experience, setExperience] =
    useState<PersonalAiGenerationLocalBrowserExperienceDto | null>(null);
  const [historyState, setHistoryState] =
    useState<StudentPersonalAiGenerationHistoryState>(
      hasSessionToken ? "loading" : "unauthorized",
    );
  const [requestHistory, setRequestHistory] =
    useState<PersonalAiGenerationRequestHistoryDto>([]);
  const [resultHistoryState, setResultHistoryState] =
    useState<StudentPersonalAiGenerationHistoryState>(
      hasSessionToken ? "loading" : "unauthorized",
    );
  const [resultHistory, setResultHistory] =
    useState<PersonalAiGenerationResultHistoryDto | null>(null);
  const [resultDetailState, setResultDetailState] =
    useState<StudentPersonalAiGenerationResultDetailState>("idle");
  const [resultDetail, setResultDetail] =
    useState<PersonalAiGenerationResultDetailDto | null>(null);
  const [selectedResultPublicId, setSelectedResultPublicId] = useState<
    string | null
  >(null);

  useEffect(() => {
    const storedSessionValue = getStoredStudentSessionToken();

    if (storedSessionValue === null) {
      return;
    }

    const storedSessionToken = storedSessionValue;
    let isCancelled = false;

    async function fetchInitialRequestHistory() {
      try {
        const historyResponse =
          await fetchPersonalAiGenerationRequestHistory(storedSessionToken);

        if (isCancelled) {
          return;
        }

        if (isStudentUnauthorizedResponse(historyResponse)) {
          setHasSessionToken(false);
          setPageState("unauthorized");
          setHistoryState("unauthorized");
          setRequestHistory([]);
          setResultHistoryState("unauthorized");
          setResultHistory(null);
          setResultDetailState("unauthorized");
          setResultDetail(null);
          setSelectedResultPublicId(null);
          return;
        }

        if (historyResponse.code !== 0 || historyResponse.data === null) {
          setHistoryState("error");
          setRequestHistory([]);
          return;
        }

        setRequestHistory(historyResponse.data);
        setHistoryState(historyResponse.data.length === 0 ? "empty" : "ready");
      } catch {
        if (!isCancelled) {
          setHistoryState("error");
          setRequestHistory([]);
        }
      }
    }

    async function fetchInitialResultHistory() {
      try {
        const historyResponse =
          await fetchPersonalAiGenerationResultHistory(storedSessionToken);

        if (isCancelled) {
          return;
        }

        if (isStudentUnauthorizedResponse(historyResponse)) {
          setHasSessionToken(false);
          setPageState("unauthorized");
          setHistoryState("unauthorized");
          setRequestHistory([]);
          setResultHistoryState("unauthorized");
          setResultHistory(null);
          setResultDetailState("unauthorized");
          setResultDetail(null);
          setSelectedResultPublicId(null);
          return;
        }

        if (historyResponse.code !== 0 || historyResponse.data === null) {
          setResultHistoryState("error");
          setResultHistory(null);
          return;
        }

        setResultHistory(historyResponse.data);
        setResultHistoryState(
          historyResponse.data.results.length === 0 ? "empty" : "ready",
        );
      } catch {
        if (!isCancelled) {
          setResultHistoryState("error");
          setResultHistory(null);
        }
      }
    }

    void fetchInitialRequestHistory();
    void fetchInitialResultHistory();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function handleSubmitPersonalAiGenerationRequest() {
    const storedSessionValue = getStoredStudentSessionToken();

    if (storedSessionValue === null) {
      setHasSessionToken(false);
      setPageState("unauthorized");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultDetailState("unauthorized");
      setResultDetail(null);
      setSelectedResultPublicId(null);
      return;
    }

    setHasSessionToken(true);
    setPageState("loading");

    try {
      const sessionResponse =
        await fetchCurrentStudentSession(storedSessionValue);

      if (isStudentUnauthorizedResponse(sessionResponse)) {
        setHasSessionToken(false);
        setPageState("unauthorized");
        setHistoryState("unauthorized");
        setRequestHistory([]);
        setResultHistoryState("unauthorized");
        setResultHistory(null);
        setResultDetailState("unauthorized");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      if (sessionResponse.code !== 0 || sessionResponse.data === null) {
        setPageState("error");
        setHistoryState("error");
        setRequestHistory([]);
        setResultHistoryState("error");
        setResultHistory(null);
        setResultDetailState("error");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      if (sessionResponse.data.user.userType === null) {
        setPageState("unauthorized");
        setHistoryState("unauthorized");
        setRequestHistory([]);
        setResultHistoryState("unauthorized");
        setResultHistory(null);
        setResultDetailState("unauthorized");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      const response =
        await fetchStudentApi<PersonalAiGenerationLocalBrowserExperienceDto>(
          "/api/v1/personal-ai-generation-requests",
          storedSessionValue,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(
              createPersonalAiGenerationRequestBody(
                personalAiGenerationRequestDraft,
                sessionResponse.data.user.publicId,
              ),
            ),
          },
        );

      if (isStudentUnauthorizedResponse(response)) {
        setHasSessionToken(false);
        setPageState("unauthorized");
        setHistoryState("unauthorized");
        setRequestHistory([]);
        setResultHistoryState("unauthorized");
        setResultHistory(null);
        setResultDetailState("unauthorized");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      if (response.code !== 0 || response.data === null) {
        setPageState("error");
        setHistoryState("error");
        setRequestHistory([]);
        setResultHistoryState("error");
        setResultHistory(null);
        setResultDetailState("error");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      setExperience(response.data);
      setPageState("ready");
      setHistoryState("loading");
      setResultHistoryState("loading");
      setResultDetailState("idle");
      setResultDetail(null);
      setSelectedResultPublicId(null);

      try {
        const historyResponse =
          await fetchPersonalAiGenerationRequestHistory(storedSessionValue);

        if (isStudentUnauthorizedResponse(historyResponse)) {
          setHasSessionToken(false);
          setPageState("unauthorized");
          setHistoryState("unauthorized");
          setRequestHistory([]);
          setResultHistoryState("unauthorized");
          setResultHistory(null);
          setResultDetailState("unauthorized");
          setResultDetail(null);
          setSelectedResultPublicId(null);
          return;
        }

        if (historyResponse.code !== 0 || historyResponse.data === null) {
          setHistoryState("error");
          setRequestHistory([]);
          return;
        }

        setRequestHistory(historyResponse.data);
        setHistoryState(historyResponse.data.length === 0 ? "empty" : "ready");
      } catch {
        setHistoryState("error");
        setRequestHistory([]);
      }

      try {
        const resultHistoryResponse =
          await fetchPersonalAiGenerationResultHistory(storedSessionValue);

        if (isStudentUnauthorizedResponse(resultHistoryResponse)) {
          setHasSessionToken(false);
          setPageState("unauthorized");
          setHistoryState("unauthorized");
          setRequestHistory([]);
          setResultHistoryState("unauthorized");
          setResultHistory(null);
          return;
        }

        if (
          resultHistoryResponse.code !== 0 ||
          resultHistoryResponse.data === null
        ) {
          setResultHistoryState("error");
          setResultHistory(null);
          return;
        }

        setResultHistory(resultHistoryResponse.data);
        setResultHistoryState(
          resultHistoryResponse.data.results.length === 0 ? "empty" : "ready",
        );
      } catch {
        setResultHistoryState("error");
        setResultHistory(null);
      }
    } catch {
      setPageState("error");
      setHistoryState("error");
      setRequestHistory([]);
      setResultHistoryState("error");
      setResultHistory(null);
      setResultDetailState("error");
      setResultDetail(null);
      setSelectedResultPublicId(null);
    }
  }

  async function handleOpenPersonalAiGenerationResultDetail(
    resultPublicId: string,
  ) {
    const storedSessionValue = getStoredStudentSessionToken();

    if (storedSessionValue === null) {
      setHasSessionToken(false);
      setPageState("unauthorized");
      setHistoryState("unauthorized");
      setRequestHistory([]);
      setResultHistoryState("unauthorized");
      setResultHistory(null);
      setResultDetailState("unauthorized");
      setResultDetail(null);
      setSelectedResultPublicId(null);
      return;
    }

    setHasSessionToken(true);
    setSelectedResultPublicId(resultPublicId);
    setResultDetailState("loading");
    setResultDetail(null);

    try {
      const detailResponse = await fetchPersonalAiGenerationResultDetail(
        storedSessionValue,
        resultPublicId,
      );

      if (isStudentUnauthorizedResponse(detailResponse)) {
        setHasSessionToken(false);
        setPageState("unauthorized");
        setHistoryState("unauthorized");
        setRequestHistory([]);
        setResultHistoryState("unauthorized");
        setResultHistory(null);
        setResultDetailState("unauthorized");
        setResultDetail(null);
        setSelectedResultPublicId(null);
        return;
      }

      if (detailResponse.code === 404019) {
        setResultDetailState("empty");
        setResultDetail(null);
        return;
      }

      if (detailResponse.code !== 0 || detailResponse.data === null) {
        setResultDetailState("error");
        setResultDetail(null);
        return;
      }

      setResultDetail(detailResponse.data);
      setResultDetailState("ready");
    } catch {
      setResultDetailState("error");
      setResultDetail(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <div className="space-y-2">
        <p className="text-brand-primary text-sm font-medium">
          personal-learning-ai
        </p>
        <h1 className="font-heading text-text-primary text-2xl font-semibold">
          {copy.title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{copy.subtitle}</p>
      </div>

      <button
        type="button"
        disabled={!hasSessionToken || pageState === "loading"}
        onClick={() => void handleSubmitPersonalAiGenerationRequest()}
        className="bg-primary text-primary-foreground flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pageState === "loading" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="size-4" aria-hidden="true" />
        )}
        {copy.requestButton}
      </button>

      {pageState === "loading" ? (
        <section
          className="border-border bg-surface rounded-xl border p-4"
          aria-busy="true"
        >
          <div className="flex items-center gap-3">
            <Loader2
              className="text-brand-primary size-5 animate-spin"
              aria-hidden="true"
            />
            <p className="text-text-primary text-sm font-medium">
              {copy.loadingTitle}
            </p>
          </div>
        </section>
      ) : null}

      {pageState === "empty" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : null}

      {pageState === "unauthorized" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.unauthorizedTitle}
          description={copy.unauthorizedDescription}
          tone="warning"
        />
      ) : null}

      {pageState === "error" ? (
        <StudentPersonalAiGenerationStateMessage
          title={copy.errorTitle}
          description={copy.errorDescription}
          tone="warning"
        />
      ) : null}

      {pageState === "ready" && experience !== null ? (
        <StudentPersonalAiGenerationContractSummary experience={experience} />
      ) : null}

      <StudentPersonalAiGenerationHistorySummary
        historyState={historyState}
        historyRows={requestHistory}
      />

      <StudentPersonalAiGenerationResultHistorySummary
        resultHistoryState={resultHistoryState}
        resultHistory={resultHistory}
        isResultDetailLoading={resultDetailState === "loading"}
        onOpenResultDetail={(resultPublicId) =>
          void handleOpenPersonalAiGenerationResultDetail(resultPublicId)
        }
        selectedResultPublicId={selectedResultPublicId}
      />

      <StudentPersonalAiGenerationResultDetailSummary
        resultDetailState={resultDetailState}
        resultDetail={resultDetail}
      />
    </section>
  );
}
