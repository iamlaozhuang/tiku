"use client";

import Link from "next/link";
import { AlertCircle, ClipboardCheck, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  COOKIE_BACKED_SESSION_MARKER,
  fetchStudentApi,
  getStoredStudentSessionToken,
  isStudentUnauthorizedResponse,
} from "@/features/student/studentRuntimeApi";
import type {
  EmployeeOrganizationTrainingAnswerDto,
  OrganizationTrainingPublishedVersionDto,
} from "@/server/contracts/organization-training-contract";

type StudentOrganizationTrainingLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "unavailable"
  | "error";

type StudentSessionRequestToken = string | null;

type VisibleListPayload = {
  versions: OrganizationTrainingPublishedVersionDto[];
};

type AnswerPayload = {
  answer: EmployeeOrganizationTrainingAnswerDto;
};

type AnswerFormValues = {
  answeredQuestionCount: string;
  score: string;
  totalScore: string;
};

type AnswerUiState = {
  answer: EmployeeOrganizationTrainingAnswerDto | null;
  message: string | null;
  values: AnswerFormValues;
};

const defaultAnswerValues: AnswerFormValues = {
  answeredQuestionCount: "1",
  score: "0",
  totalScore: "0",
};

function readStudentSessionRequestToken(): StudentSessionRequestToken {
  const storedSessionValue = getStoredStudentSessionToken();

  return storedSessionValue === COOKIE_BACKED_SESSION_MARKER
    ? null
    : storedSessionValue;
}

function isStudentAccessDeniedResponse(payload: { code: number }): boolean {
  return (
    (payload.code >= 403000 && payload.code < 404000) || payload.code === 409076
  );
}

function createInitialAnswerState(): AnswerUiState {
  return {
    answer: null,
    message: null,
    values: defaultAnswerValues,
  };
}

function createAnswerRequestBody(
  trainingVersionPublicId: string,
  values: AnswerFormValues,
) {
  return {
    trainingVersionPublicId,
    answeredQuestionCount: Number(values.answeredQuestionCount),
  };
}

function createSubmitRequestBody(
  trainingVersionPublicId: string,
  values: AnswerFormValues,
) {
  return {
    ...createAnswerRequestBody(trainingVersionPublicId, values),
    scoreSummary: {
      score: Number(values.score),
      totalScore: Number(values.totalScore),
    },
  };
}

function StudentOrganizationTrainingStatusMessage({
  action,
  description,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="bg-secondary text-secondary-foreground flex size-11 items-center justify-center rounded-full">
        <AlertCircle aria-hidden="true" className="size-5" />
      </div>
      <div className="space-y-2">
        <h1 className="font-heading text-text-primary text-xl font-semibold">
          {title}
        </h1>
        <p className="text-text-secondary text-sm leading-6">{description}</p>
      </div>
      {action}
    </section>
  );
}

function StudentOrganizationTrainingLoading() {
  return (
    <section
      aria-live="polite"
      className="mx-auto w-full max-w-3xl space-y-4 px-4 py-5"
      role="status"
    >
      <div className="text-text-secondary flex items-center gap-2 text-sm">
        <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        正在加载组织培训
      </div>
      <div className="bg-surface ring-border rounded-xl p-4 shadow-sm ring-1">
        <div className="bg-border h-5 w-2/3 animate-pulse rounded" />
        <div className="bg-border mt-3 h-4 w-1/2 animate-pulse rounded" />
        <div className="bg-border mt-5 h-10 w-full animate-pulse rounded-lg" />
      </div>
    </section>
  );
}

export function StudentOrganizationTrainingPage() {
  const [loadState, setLoadState] =
    useState<StudentOrganizationTrainingLoadState>("loading");
  const [versions, setVersions] = useState<
    OrganizationTrainingPublishedVersionDto[]
  >([]);
  const [answerStateByVersionPublicId, setAnswerStateByVersionPublicId] =
    useState<Record<string, AnswerUiState>>({});

  useEffect(() => {
    let isActive = true;

    async function loadVisibleTrainings() {
      const sessionValue = readStudentSessionRequestToken();

      try {
        const response = await fetchStudentApi<VisibleListPayload>(
          "/api/v1/organization-trainings/visible-list",
          sessionValue,
          {
            method: "GET",
          },
        );

        if (!isActive) {
          return;
        }

        if (isStudentUnauthorizedResponse(response)) {
          setLoadState("unauthorized");
          return;
        }

        if (isStudentAccessDeniedResponse(response)) {
          setLoadState("unavailable");
          return;
        }

        if (response.code !== 0 || response.data === null) {
          setLoadState("error");
          return;
        }

        setVersions(response.data.versions);
        setAnswerStateByVersionPublicId(
          Object.fromEntries(
            response.data.versions.map((version) => [
              version.publicId,
              createInitialAnswerState(),
            ]),
          ),
        );
        setLoadState(response.data.versions.length === 0 ? "empty" : "ready");
      } catch {
        if (isActive) {
          setLoadState("error");
        }
      }
    }

    void loadVisibleTrainings();

    return () => {
      isActive = false;
    };
  }, []);

  if (loadState === "loading") {
    return <StudentOrganizationTrainingLoading />;
  }

  if (loadState === "unauthorized") {
    return (
      <StudentOrganizationTrainingStatusMessage
        title="请先登录"
        description="组织培训作答需要有效的员工会话。"
        action={
          <Link
            className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
            href="/login"
          >
            前往登录
          </Link>
        }
      />
    );
  }

  if (loadState === "error") {
    return (
      <StudentOrganizationTrainingStatusMessage
        title="组织培训加载失败"
        description="请刷新页面，或重新登录后再查看组织培训。"
      />
    );
  }

  if (loadState === "unavailable") {
    return (
      <StudentOrganizationTrainingStatusMessage
        title="\u5f53\u524d\u6388\u6743\u6682\u672a\u5f00\u653e\u4f01\u4e1a\u8bad\u7ec3"
        description="\u8bf7\u786e\u8ba4\u5458\u5de5\u8d26\u53f7\u5df2\u7ed1\u5b9a\u6709\u6548\u7684\u7ec4\u7ec7\u9ad8\u7ea7\u6388\u6743\u8303\u56f4\uff1b\u672c\u9875\u4ec5\u663e\u793a\u5df2\u53d1\u5e03\u4e14\u5bf9\u5f53\u524d\u5458\u5de5\u53ef\u89c1\u7684\u57f9\u8bad\u3002"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <StudentOrganizationTrainingStatusMessage
        title="暂无组织培训"
        description="当前组织范围内还没有可作答的组织培训。"
      />
    );
  }

  function updateAnswerState(
    trainingVersionPublicId: string,
    updater: (state: AnswerUiState) => AnswerUiState,
  ) {
    setAnswerStateByVersionPublicId((currentState) => ({
      ...currentState,
      [trainingVersionPublicId]: updater(
        currentState[trainingVersionPublicId] ?? createInitialAnswerState(),
      ),
    }));
  }

  async function handleSaveDraft(trainingVersionPublicId: string) {
    const sessionValue = readStudentSessionRequestToken();

    const currentState =
      answerStateByVersionPublicId[trainingVersionPublicId] ??
      createInitialAnswerState();
    const response = await fetchStudentApi<AnswerPayload>(
      `/api/v1/organization-trainings/${trainingVersionPublicId}/employee-answers/draft-save`,
      sessionValue,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(
          createAnswerRequestBody(trainingVersionPublicId, currentState.values),
        ),
      },
    );

    if (isStudentUnauthorizedResponse(response)) {
      setLoadState("unauthorized");
      return;
    }

    if (isStudentAccessDeniedResponse(response)) {
      setLoadState("unavailable");
      return;
    }

    if (response.code !== 0 || response.data === null) {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        message: "草稿保存失败",
      }));
      return;
    }

    const savedAnswer = response.data.answer;

    updateAnswerState(trainingVersionPublicId, (state) => ({
      ...state,
      answer: savedAnswer,
      message: "草稿已保存",
    }));
  }

  async function handleSubmit(trainingVersionPublicId: string) {
    const sessionValue = readStudentSessionRequestToken();

    const currentState =
      answerStateByVersionPublicId[trainingVersionPublicId] ??
      createInitialAnswerState();
    const response = await fetchStudentApi<AnswerPayload>(
      `/api/v1/organization-trainings/${trainingVersionPublicId}/employee-answers/submit`,
      sessionValue,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(
          createSubmitRequestBody(trainingVersionPublicId, currentState.values),
        ),
      },
    );

    if (isStudentUnauthorizedResponse(response)) {
      setLoadState("unauthorized");
      return;
    }

    if (isStudentAccessDeniedResponse(response)) {
      setLoadState("unavailable");
      return;
    }

    if (response.code !== 0 || response.data === null) {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        message: "提交失败",
      }));
      return;
    }

    const submittedAnswer = response.data.answer;

    updateAnswerState(trainingVersionPublicId, (state) => ({
      ...state,
      answer: submittedAnswer,
      message: "提交成功",
    }));
  }

  async function handleLoadReadonlySummary(trainingVersionPublicId: string) {
    const sessionValue = readStudentSessionRequestToken();

    const response = await fetchStudentApi<AnswerPayload>(
      `/api/v1/organization-trainings/${trainingVersionPublicId}/employee-answers/readonly-summary`,
      sessionValue,
      {
        method: "GET",
      },
    );

    if (isStudentUnauthorizedResponse(response)) {
      setLoadState("unauthorized");
      return;
    }

    if (isStudentAccessDeniedResponse(response)) {
      setLoadState("unavailable");
      return;
    }

    if (response.code !== 0 || response.data === null) {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        message: "readonly-summary 加载失败",
      }));
      return;
    }

    const readonlyAnswer = response.data.answer;

    updateAnswerState(trainingVersionPublicId, (state) => ({
      ...state,
      answer: readonlyAnswer,
      message: "readonly-summary 已加载",
    }));
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">
            Organization Training
          </p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            组织培训作答
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            查看组织分配的培训，保存作答进度，并提交只读摘要。
          </p>
        </div>
        <div className="bg-secondary text-secondary-foreground flex size-11 shrink-0 items-center justify-center rounded-full">
          <ClipboardCheck aria-hidden="true" className="size-5" />
        </div>
      </header>

      <div className="space-y-3">
        {versions.map((version) => (
          <TrainingVersionCard
            answerState={
              answerStateByVersionPublicId[version.publicId] ??
              createInitialAnswerState()
            }
            key={version.publicId}
            version={version}
            onChangeValues={(values) =>
              updateAnswerState(version.publicId, (state) => ({
                ...state,
                values,
              }))
            }
            onLoadReadonlySummary={() =>
              void handleLoadReadonlySummary(version.publicId)
            }
            onSaveDraft={() => void handleSaveDraft(version.publicId)}
            onSubmit={() => void handleSubmit(version.publicId)}
          />
        ))}
      </div>
    </section>
  );
}

function TrainingVersionCard({
  answerState,
  version,
  onChangeValues,
  onLoadReadonlySummary,
  onSaveDraft,
  onSubmit,
}: {
  answerState: AnswerUiState;
  version: OrganizationTrainingPublishedVersionDto;
  onChangeValues: (values: AnswerFormValues) => void;
  onLoadReadonlySummary: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const scoreSummary = answerState.answer?.scoreSummary ?? null;

  return (
    <article
      className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1"
      data-public-id={version.publicId}
      data-testid={`organization-training-row-${version.publicId}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="font-heading text-text-primary text-lg font-semibold">
            {version.title}
          </h2>
          <p className="text-text-secondary text-sm">
            {version.questionCount} 题 / {version.totalScore} 分
          </p>
        </div>
        <code className="bg-muted text-text-secondary rounded-md px-2 py-1 font-mono text-xs">
          {version.publicId}
        </code>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField
          label="已答题数"
          value={answerState.values.answeredQuestionCount}
          onChange={(value) =>
            onChangeValues({
              ...answerState.values,
              answeredQuestionCount: value,
            })
          }
        />
        <NumberField
          label="得分"
          value={answerState.values.score}
          onChange={(value) =>
            onChangeValues({
              ...answerState.values,
              score: value,
            })
          }
        />
        <NumberField
          label="总分"
          value={answerState.values.totalScore}
          onChange={(value) =>
            onChangeValues({
              ...answerState.values,
              totalScore: value,
            })
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          className="bg-secondary text-secondary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          type="button"
          onClick={onSaveDraft}
        >
          保存草稿
        </button>
        <button
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
          type="button"
          onClick={onSubmit}
        >
          提交
        </button>
        <button
          className="border-border text-text-primary hover:bg-muted flex h-9 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
          type="button"
          onClick={onLoadReadonlySummary}
        >
          查看结果
        </button>
      </div>

      {answerState.message === null ? null : (
        <p className="text-brand-primary text-sm">{answerState.message}</p>
      )}
      {scoreSummary === null ? null : (
        <p className="text-text-primary text-sm font-medium">
          结果 {scoreSummary.score} / {scoreSummary.totalScore}
        </p>
      )}
    </article>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      <span className="text-text-secondary">{label}</span>
      <input
        aria-label={label}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface h-9 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
        min={0}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
