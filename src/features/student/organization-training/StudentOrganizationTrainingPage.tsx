"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  LoaderCircle,
} from "lucide-react";
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

const professionLabels: Record<string, string> = {
  logistics: "物流配送",
  marketing: "卷烟营销",
  monopoly: "烟草专卖",
};

const subjectLabels: Record<string, string> = {
  skill: "技能",
  theory: "理论",
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

function createInitialAnswerState(totalScore = "0"): AnswerUiState {
  return {
    answer: null,
    message: null,
    values: {
      ...defaultAnswerValues,
      totalScore,
    },
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
  role = "alert",
  title,
}: {
  action?: React.ReactNode;
  description: string;
  role?: "alert" | "status";
  title: string;
}) {
  return (
    <section
      aria-live={role === "alert" ? "assertive" : "polite"}
      className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
      role={role}
    >
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
        正在加载企业训练
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
              createInitialAnswerState(String(version.totalScore)),
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
        description="企业训练作答需要有效的员工会话。"
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
        title="企业训练加载失败"
        description="请刷新页面，或重新登录后再查看企业训练。"
      />
    );
  }

  if (loadState === "unavailable") {
    return (
      <StudentOrganizationTrainingStatusMessage
        title="当前授权暂未开放企业训练"
        description="请确认员工账号已绑定有效的组织高级授权范围；本页仅显示已发布且对当前员工可见的培训。"
      />
    );
  }

  if (loadState === "empty") {
    return (
      <StudentOrganizationTrainingStatusMessage
        role="status"
        title="暂无企业训练"
        description="当前组织范围内还没有可作答的企业训练。"
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
        message: "结果加载失败",
      }));
      return;
    }

    const readonlyAnswer = response.data.answer;

    updateAnswerState(trainingVersionPublicId, (state) => ({
      ...state,
      answer: readonlyAnswer,
      message: "结果已加载",
    }));
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-5 pb-20">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-brand-primary text-sm font-medium">企业训练</p>
          <h1 className="font-heading text-text-primary text-2xl font-semibold">
            企业训练
          </h1>
          <p className="text-text-secondary text-sm leading-6">
            查看企业分配的训练，保存作答进度，提交后查看自己的结果。
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
              createInitialAnswerState(String(version.totalScore))
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
  const [isSubmitConfirming, setIsSubmitConfirming] = useState(false);
  const answeredQuestionCount = Number(
    answerState.values.answeredQuestionCount,
  );
  const progressPercent =
    Number.isFinite(answeredQuestionCount) && version.questionCount > 0
      ? Math.min(
          100,
          Math.max(0, (answeredQuestionCount / version.questionCount) * 100),
        )
      : 0;

  function handleSubmitClick() {
    setIsSubmitConfirming(true);
  }

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
          <div className="text-text-secondary flex flex-wrap gap-2 text-xs">
            <span className="bg-muted rounded-md px-2 py-1">
              {professionLabels[version.profession] ?? version.profession}
            </span>
            <span className="bg-muted rounded-md px-2 py-1">
              {version.level} 级
            </span>
            <span className="bg-muted rounded-md px-2 py-1">
              {subjectLabels[version.subject] ?? version.subject}
            </span>
            <span className="bg-muted rounded-md px-2 py-1">
              第 {version.versionNumber} 版
            </span>
          </div>
        </div>
        <span className="bg-success/10 text-success inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium">
          <CheckCircle2 aria-hidden="true" className="size-3.5" />
          可作答
        </span>
      </div>

      <div
        aria-label="企业训练作答区"
        className="bg-muted space-y-3 rounded-md p-3"
        role="group"
      >
        <div className="text-text-primary flex items-center gap-2 text-sm font-medium">
          <ClipboardList aria-hidden="true" className="size-4" />
          作答进度
        </div>
        <p className="text-text-secondary text-sm">
          共 {version.questionCount} 题 / {version.totalScore}{" "}
          分，提交后结果摘要只读。
        </p>
        <div className="bg-surface h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <NumberField
          label="完成题数"
          value={answerState.values.answeredQuestionCount}
          onChange={(value) =>
            onChangeValues({
              ...answerState.values,
              answeredQuestionCount: value,
            })
          }
        />
      </div>

      <details className="border-border rounded-md border p-3">
        <summary className="text-text-primary cursor-pointer text-sm font-medium">
          结果摘要
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
      </details>

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
          onClick={handleSubmitClick}
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

      {isSubmitConfirming ? (
        <div
          aria-label="企业训练提交确认"
          className="border-warning/30 bg-warning/10 grid gap-3 rounded-md border p-3 text-sm"
          role="group"
        >
          <p className="text-text-primary">
            确认提交企业训练？提交后将进入结果查看。
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="border-border text-text-primary flex h-9 items-center justify-center rounded-lg border bg-transparent text-sm font-medium transition-transform active:scale-[0.98]"
              type="button"
              onClick={() => setIsSubmitConfirming(false)}
            >
              取消
            </button>
            <button
              className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98]"
              type="button"
              onClick={() => {
                setIsSubmitConfirming(false);
                onSubmit();
              }}
            >
              确认提交
            </button>
          </div>
        </div>
      ) : null}

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
