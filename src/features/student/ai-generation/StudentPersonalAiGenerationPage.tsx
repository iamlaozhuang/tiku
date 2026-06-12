"use client";

import { AlertCircle, Loader2, Sparkles, ShieldAlert } from "lucide-react";
import { useState } from "react";

import {
  fetchStudentApi,
  getStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import type { PersonalAiGenerationLocalBrowserExperienceDto } from "@/server/contracts/personal-ai-generation-local-browser-experience-contract";
import type { PersonalAiGenerationFuncType } from "@/server/models/personal-ai-generation-request";

type StudentPersonalAiGenerationPageState =
  | "empty"
  | "loading"
  | "ready"
  | "error"
  | "unauthorized";

type StudentPersonalAiGenerationRequestDraft = {
  userPublicId: string;
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
};

const personalAiGenerationRequestDraft: StudentPersonalAiGenerationRequestDraft =
  {
    userPublicId: "student-public-001",
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

function readHasStudentSessionToken(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return getStoredStudentSessionToken() !== null;
}

function createPersonalAiGenerationRequestBody(
  draft: StudentPersonalAiGenerationRequestDraft,
) {
  return {
    responseMode: "local_browser_experience",
    ...draft,
  };
}

function formatNullableText(value: string | null | undefined): string {
  return value ?? "null";
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

  async function handleSubmitPersonalAiGenerationRequest() {
    const storedSessionValue = getStoredStudentSessionToken();

    if (storedSessionValue === null) {
      setHasSessionToken(false);
      setPageState("unauthorized");
      return;
    }

    setHasSessionToken(true);
    setPageState("loading");

    try {
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
              ),
            ),
          },
        );

      if (isStudentUnauthorizedResponse(response)) {
        setPageState("unauthorized");
        return;
      }

      if (response.code !== 0 || response.data === null) {
        setPageState("error");
        return;
      }

      setExperience(response.data);
      setPageState("ready");
    } catch {
      setPageState("error");
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
    </section>
  );
}
