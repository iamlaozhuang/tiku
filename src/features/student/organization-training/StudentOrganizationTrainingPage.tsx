"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
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
  EmployeeOrganizationTrainingAnswerItemDto,
  EmployeeOrganizationTrainingAnswerDto,
  EmployeeOrganizationTrainingQuestionResultDto,
  OrganizationTrainingQuestionSnapshotDto,
  OrganizationTrainingPublishedVersionDto,
} from "@/server/contracts/organization-training-contract";

type StudentOrganizationTrainingLoadState =
  | "loading"
  | "ready"
  | "empty"
  | "unauthorized"
  | "standard_unavailable"
  | "missing_context"
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
  answerItemsByQuestionPublicId: Record<string, AnswerItemFormValue>;
};

type AnswerItemFormValue = {
  selectedOptionPublicIds: string[];
  textAnswer: string;
};

type AnswerPendingAction = "saving" | "submitting" | "loading_result";

type AnswerFeedback = {
  kind: "error" | "success";
  text: string;
};

type AnswerUiState = {
  answer: EmployeeOrganizationTrainingAnswerDto | null;
  feedback: AnswerFeedback | null;
  pendingAction: AnswerPendingAction | null;
  values: AnswerFormValues;
};

type TrainingOverviewItem = {
  label: string;
  value: number;
};

const dueSoonWindowMilliseconds = 7 * 24 * 60 * 60 * 1000;

const emptyAnswerFormValues: AnswerFormValues = {
  answerItemsByQuestionPublicId: {},
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

function isStudentForbiddenResponse(payload: { code: number }): boolean {
  return payload.code >= 403000 && payload.code < 404000;
}

function createEmptyAnswerItemValue(): AnswerItemFormValue {
  return {
    selectedOptionPublicIds: [],
    textAnswer: "",
  };
}

function createInitialAnswerValues(
  version: OrganizationTrainingPublishedVersionDto | null,
): AnswerFormValues {
  if (version?.questions === undefined) {
    return emptyAnswerFormValues;
  }

  return {
    answerItemsByQuestionPublicId: Object.fromEntries(
      version.questions.map((question) => [
        question.publicId,
        createEmptyAnswerItemValue(),
      ]),
    ),
  };
}

function createInitialAnswerState(
  version: OrganizationTrainingPublishedVersionDto | null = null,
): AnswerUiState {
  return {
    answer: null,
    feedback: null,
    pendingAction: null,
    values: createInitialAnswerValues(version),
  };
}

function isReadonlyTraining(
  version: OrganizationTrainingPublishedVersionDto,
  answer: EmployeeOrganizationTrainingAnswerDto | null,
): boolean {
  return (
    version.employeeAnswerStatus === "submitted" ||
    version.employeeAnswerStatus === "read_only" ||
    answer?.answerStatus === "submitted" ||
    answer?.answerStatus === "read_only"
  );
}

function isTrainingDueSoon(
  version: OrganizationTrainingPublishedVersionDto,
  currentTime = Date.now(),
): boolean {
  if (
    version.employeeAnswerStatus === "submitted" ||
    version.employeeAnswerStatus === "read_only" ||
    typeof version.answerDeadlineAt !== "string"
  ) {
    return false;
  }

  const deadlineTime = Date.parse(version.answerDeadlineAt);

  return (
    Number.isFinite(deadlineTime) &&
    deadlineTime >= currentTime &&
    deadlineTime <= currentTime + dueSoonWindowMilliseconds
  );
}

function createTrainingOverview(
  versions: OrganizationTrainingPublishedVersionDto[],
): TrainingOverviewItem[] {
  return [
    { label: "已分配", value: versions.length },
    {
      label: "即将到期",
      value: versions.filter((version) => isTrainingDueSoon(version)).length,
    },
    {
      label: "进行中",
      value: versions.filter(
        (version) => version.employeeAnswerStatus === "in_progress",
      ).length,
    },
    {
      label: "已提交",
      value: versions.filter(
        (version) =>
          version.employeeAnswerStatus === "submitted" ||
          version.employeeAnswerStatus === "read_only",
      ).length,
    },
    {
      label: "未开始",
      value: versions.filter(
        (version) =>
          version.employeeAnswerStatus === undefined ||
          version.employeeAnswerStatus === "not_started",
      ).length,
    },
  ];
}

function getTrainingPrimaryActionLabel(
  status: OrganizationTrainingPublishedVersionDto["employeeAnswerStatus"],
): string {
  if (status === "submitted" || status === "read_only") {
    return "查看结果";
  }

  if (status === "in_progress") {
    return "继续训练";
  }

  return "开始训练";
}

function readAnswerItemValue(
  values: AnswerFormValues,
  questionPublicId: string,
): AnswerItemFormValue {
  return (
    values.answerItemsByQuestionPublicId[questionPublicId] ??
    createEmptyAnswerItemValue()
  );
}

function isQuestionAnswered(
  question: OrganizationTrainingQuestionSnapshotDto,
  values: AnswerFormValues,
): boolean {
  const answerItem = readAnswerItemValue(values, question.publicId);

  if (question.questionType === "short_answer") {
    return answerItem.textAnswer.trim().length > 0;
  }

  return answerItem.selectedOptionPublicIds.length > 0;
}

function countAnsweredQuestions(
  version: OrganizationTrainingPublishedVersionDto,
  values: AnswerFormValues,
): number {
  const questions = version.questions ?? [];

  if (questions.length === 0) {
    return 0;
  }

  return questions.filter((question) => isQuestionAnswered(question, values))
    .length;
}

function createAnswerItems(
  version: OrganizationTrainingPublishedVersionDto,
  values: AnswerFormValues,
): EmployeeOrganizationTrainingAnswerItemDto[] {
  return (version.questions ?? []).map((question) => {
    const answerItem = readAnswerItemValue(values, question.publicId);
    const textAnswer = answerItem.textAnswer.trim();

    return {
      questionPublicId: question.publicId,
      selectedOptionPublicIds: answerItem.selectedOptionPublicIds,
      textAnswer: textAnswer.length > 0 ? textAnswer : null,
    };
  });
}

function createAnswerRequestBody(
  version: OrganizationTrainingPublishedVersionDto,
  values: AnswerFormValues,
) {
  return {
    trainingVersionPublicId: version.publicId,
    answeredQuestionCount: countAnsweredQuestions(version, values),
    answerItems: createAnswerItems(version, values),
  };
}

function createSubmitRequestBody(
  version: OrganizationTrainingPublishedVersionDto,
  values: AnswerFormValues,
) {
  return {
    ...createAnswerRequestBody(version, values),
    scoreSummary: {
      score: 0,
      totalScore: version.totalScore,
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
  const [selectedTrainingVersionPublicId, setSelectedTrainingVersionPublicId] =
    useState<string | null>(null);
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

        if (response.code === 409076) {
          setLoadState("standard_unavailable");
          return;
        }

        if (response.code === 403074) {
          setLoadState("missing_context");
          return;
        }

        if (isStudentForbiddenResponse(response)) {
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
              createInitialAnswerState(version),
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

  if (loadState === "standard_unavailable") {
    return (
      <StudentOrganizationTrainingStatusMessage
        title="企业训练需要高级版"
        description="当前组织授权为标准版，此功能需要高级版企业授权。"
      />
    );
  }

  if (loadState === "missing_context") {
    return (
      <StudentOrganizationTrainingStatusMessage
        title="缺少组织上下文"
        description="当前账号未绑定可用组织上下文。"
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

  function updateVersionAnswerStatus(
    trainingVersionPublicId: string,
    answer: EmployeeOrganizationTrainingAnswerDto,
  ) {
    setVersions((currentVersions) =>
      currentVersions.map((version) => {
        if (version.publicId !== trainingVersionPublicId) {
          return version;
        }

        return {
          ...version,
          employeeAnswerStatus:
            answer.answerStatus === "submitted" ||
            answer.answerStatus === "read_only"
              ? answer.answerStatus
              : "in_progress",
          submittedScoreSummary:
            answer.scoreSummary ?? version.submittedScoreSummary,
        };
      }),
    );
  }

  function handleActionAccessDenied(
    trainingVersionPublicId: string,
    response: { code: number },
  ): boolean {
    if (response.code === 409076) {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        feedback: {
          kind: "error",
          text: "当前训练已不能继续作答，请返回列表刷新状态。",
        },
      }));
      return true;
    }

    if (response.code === 403074) {
      setLoadState("missing_context");
      return true;
    }

    if (isStudentForbiddenResponse(response)) {
      setLoadState("unavailable");
      return true;
    }

    return false;
  }

  async function handleSaveDraft(
    version: OrganizationTrainingPublishedVersionDto,
  ) {
    const sessionValue = readStudentSessionRequestToken();
    const trainingVersionPublicId = version.publicId;

    const currentState =
      answerStateByVersionPublicId[trainingVersionPublicId] ??
      createInitialAnswerState(version);
    if (
      currentState.pendingAction !== null ||
      isReadonlyTraining(version, currentState.answer)
    ) {
      return;
    }

    updateAnswerState(trainingVersionPublicId, (state) => ({
      ...state,
      feedback: null,
      pendingAction: "saving",
    }));

    try {
      const response = await fetchStudentApi<AnswerPayload>(
        `/api/v1/organization-trainings/${trainingVersionPublicId}/employee-answers/draft-save`,
        sessionValue,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(
            createAnswerRequestBody(version, currentState.values),
          ),
        },
      );

      if (isStudentUnauthorizedResponse(response)) {
        setLoadState("unauthorized");
        return;
      }

      if (handleActionAccessDenied(trainingVersionPublicId, response)) {
        return;
      }

      if (response.code !== 0 || response.data === null) {
        updateAnswerState(trainingVersionPublicId, (state) => ({
          ...state,
          feedback: { kind: "error", text: "草稿保存失败" },
        }));
        return;
      }

      const savedAnswer = response.data.answer;

      updateVersionAnswerStatus(trainingVersionPublicId, savedAnswer);
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        answer: savedAnswer,
        feedback: { kind: "success", text: "草稿已保存" },
      }));
    } catch {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        feedback: { kind: "error", text: "草稿保存失败" },
      }));
    } finally {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        pendingAction: null,
      }));
    }
  }

  async function handleSubmit(
    version: OrganizationTrainingPublishedVersionDto,
  ) {
    const sessionValue = readStudentSessionRequestToken();
    const trainingVersionPublicId = version.publicId;

    const currentState =
      answerStateByVersionPublicId[trainingVersionPublicId] ??
      createInitialAnswerState(version);
    if (
      currentState.pendingAction !== null ||
      isReadonlyTraining(version, currentState.answer)
    ) {
      return;
    }

    updateAnswerState(trainingVersionPublicId, (state) => ({
      ...state,
      feedback: null,
      pendingAction: "submitting",
    }));

    try {
      const response = await fetchStudentApi<AnswerPayload>(
        `/api/v1/organization-trainings/${trainingVersionPublicId}/employee-answers/submit`,
        sessionValue,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(
            createSubmitRequestBody(version, currentState.values),
          ),
        },
      );

      if (isStudentUnauthorizedResponse(response)) {
        setLoadState("unauthorized");
        return;
      }

      if (handleActionAccessDenied(trainingVersionPublicId, response)) {
        return;
      }

      if (response.code !== 0 || response.data === null) {
        updateAnswerState(trainingVersionPublicId, (state) => ({
          ...state,
          feedback: { kind: "error", text: "提交失败" },
        }));
        return;
      }

      const submittedAnswer = response.data.answer;

      updateVersionAnswerStatus(trainingVersionPublicId, submittedAnswer);
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        answer: submittedAnswer,
        feedback: { kind: "success", text: "提交成功" },
      }));
    } catch {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        feedback: { kind: "error", text: "提交失败" },
      }));
    } finally {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        pendingAction: null,
      }));
    }
  }

  async function handleLoadReadonlySummary(trainingVersionPublicId: string) {
    const sessionValue = readStudentSessionRequestToken();
    const currentState =
      answerStateByVersionPublicId[trainingVersionPublicId] ??
      createInitialAnswerState();

    if (currentState.pendingAction !== null) {
      return;
    }

    updateAnswerState(trainingVersionPublicId, (state) => ({
      ...state,
      feedback: null,
      pendingAction: "loading_result",
    }));

    try {
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

      if (handleActionAccessDenied(trainingVersionPublicId, response)) {
        return;
      }

      if (response.code !== 0 || response.data === null) {
        updateAnswerState(trainingVersionPublicId, (state) => ({
          ...state,
          feedback: { kind: "error", text: "结果加载失败" },
        }));
        return;
      }

      const readonlyAnswer = response.data.answer;

      updateVersionAnswerStatus(trainingVersionPublicId, readonlyAnswer);
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        answer: readonlyAnswer,
        feedback: { kind: "success", text: "结果已加载" },
      }));
    } catch {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        feedback: { kind: "error", text: "结果加载失败" },
      }));
    } finally {
      updateAnswerState(trainingVersionPublicId, (state) => ({
        ...state,
        pendingAction: null,
      }));
    }
  }

  function handleSelectTraining(
    version: OrganizationTrainingPublishedVersionDto,
  ) {
    setSelectedTrainingVersionPublicId(version.publicId);

    const answerState =
      answerStateByVersionPublicId[version.publicId] ??
      createInitialAnswerState(version);

    if (isReadonlyTraining(version, answerState.answer)) {
      void handleLoadReadonlySummary(version.publicId);
    }
  }

  const selectedVersion = versions.find(
    (version) => version.publicId === selectedTrainingVersionPublicId,
  );

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

      {selectedVersion === undefined ? (
        <>
          <section
            aria-label="企业训练概览"
            className="grid grid-cols-2 gap-3 sm:grid-cols-5"
            role="region"
          >
            {createTrainingOverview(versions).map((item) => (
              <div
                className="bg-surface ring-border rounded-xl p-3 shadow-sm ring-1"
                key={item.label}
              >
                <p className="text-text-secondary text-xs">{item.label}</p>
                <p className="text-text-primary mt-1 text-xl font-semibold">
                  {item.value}
                </p>
              </div>
            ))}
          </section>

          <div className="space-y-3">
            {versions.map((version) => (
              <TrainingVersionSummaryCard
                key={version.publicId}
                version={version}
                onSelect={() => handleSelectTraining(version)}
              />
            ))}
          </div>
        </>
      ) : (
        <TrainingVersionWorkspace
          answerState={
            answerStateByVersionPublicId[selectedVersion.publicId] ??
            createInitialAnswerState(selectedVersion)
          }
          version={selectedVersion}
          onBack={() => setSelectedTrainingVersionPublicId(null)}
          onChangeValues={(values) =>
            updateAnswerState(selectedVersion.publicId, (state) => ({
              ...state,
              values,
            }))
          }
          onLoadReadonlySummary={() =>
            void handleLoadReadonlySummary(selectedVersion.publicId)
          }
          onSaveDraft={() => void handleSaveDraft(selectedVersion)}
          onSubmit={() => void handleSubmit(selectedVersion)}
        />
      )}
    </section>
  );
}

function TrainingVersionSummaryCard({
  onSelect,
  version,
}: {
  onSelect: () => void;
  version: OrganizationTrainingPublishedVersionDto;
}) {
  const answerStatusLabel = getAnswerStatusLabel(version.employeeAnswerStatus);

  return (
    <article
      className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1"
      data-public-id={version.publicId}
      data-testid={`organization-training-row-${version.publicId}`}
    >
      <TrainingVersionHeader
        answerStatusLabel={answerStatusLabel}
        version={version}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-text-secondary text-sm">
          训练进度：{answerStatusLabel}
        </p>
        <button
          className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-transform active:scale-[0.98]"
          type="button"
          onClick={onSelect}
        >
          {getTrainingPrimaryActionLabel(version.employeeAnswerStatus)}
        </button>
      </div>
    </article>
  );
}

function TrainingVersionHeader({
  answerStatusLabel,
  version,
}: {
  answerStatusLabel: string;
  version: OrganizationTrainingPublishedVersionDto;
}) {
  const organizationName = version.organizationName ?? "当前组织节点";

  return (
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
          <span className="bg-muted rounded-md px-2 py-1">
            {organizationName}
          </span>
          <span className="bg-muted rounded-md px-2 py-1">
            共 {version.questionCount} 题
          </span>
          <span className="bg-muted rounded-md px-2 py-1">
            截止 {formatDateLabel(version.answerDeadlineAt)}
          </span>
        </div>
      </div>
      <span className="bg-success/10 text-success inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium">
        <CheckCircle2 aria-hidden="true" className="size-3.5" />
        {answerStatusLabel}
      </span>
    </div>
  );
}

function TrainingVersionWorkspace({
  answerState,
  version,
  onBack,
  onChangeValues,
  onLoadReadonlySummary,
  onSaveDraft,
  onSubmit,
}: {
  answerState: AnswerUiState;
  version: OrganizationTrainingPublishedVersionDto;
  onBack: () => void;
  onChangeValues: (values: AnswerFormValues) => void;
  onLoadReadonlySummary: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  const [isSubmitConfirming, setIsSubmitConfirming] = useState(false);
  const answeredQuestionCount = countAnsweredQuestions(
    version,
    answerState.values,
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

  function updateAnswerItemValue(
    questionPublicId: string,
    updater: (value: AnswerItemFormValue) => AnswerItemFormValue,
  ) {
    const currentAnswerItem = readAnswerItemValue(
      answerState.values,
      questionPublicId,
    );

    onChangeValues({
      answerItemsByQuestionPublicId: {
        ...answerState.values.answerItemsByQuestionPublicId,
        [questionPublicId]: updater(currentAnswerItem),
      },
    });
  }

  const questions = version.questions ?? [];
  const isReadonly = isReadonlyTraining(version, answerState.answer);
  const answerStatusLabel = isReadonly
    ? "已提交"
    : answerState.answer?.answerStatus === "in_progress" ||
        version.employeeAnswerStatus === "in_progress"
      ? "进行中"
      : "未开始";
  const isPending = answerState.pendingAction !== null;

  return (
    <article
      aria-busy={isPending}
      className="bg-surface ring-border space-y-4 rounded-xl p-4 shadow-sm ring-1"
      data-public-id={version.publicId}
      data-testid={`organization-training-workspace-${version.publicId}`}
    >
      <button
        className="border-border text-text-primary hover:bg-muted inline-flex h-9 items-center gap-2 rounded-lg border bg-transparent px-3 text-sm font-medium transition-transform active:scale-[0.98]"
        type="button"
        onClick={onBack}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        返回训练列表
      </button>

      <TrainingVersionHeader
        answerStatusLabel={answerStatusLabel}
        version={version}
      />

      <div
        aria-label="企业训练作答区"
        className="bg-muted space-y-4 rounded-md p-3"
        role="group"
      >
        <div className="text-text-primary flex items-center gap-2 text-sm font-medium">
          <ClipboardList aria-hidden="true" className="size-4" />
          作答区
        </div>
        <p className="text-text-secondary text-sm">
          {isReadonly
            ? `已提交，共 ${version.questionCount} 题，只读查看。`
            : `已作答 ${answeredQuestionCount} / ${version.questionCount} 题，提交前可保存草稿。`}
        </p>
        <div className="bg-surface h-2 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {questions.length === 0 ? (
          <p className="text-text-secondary bg-surface rounded-md p-3 text-sm">
            题目快照暂未返回，请稍后刷新或联系企业管理员确认训练来源。
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <QuestionAnswerField
                answerItem={readAnswerItemValue(
                  answerState.values,
                  question.publicId,
                )}
                disabled={isReadonly}
                key={question.publicId}
                question={question}
                onChange={(updater) =>
                  updateAnswerItemValue(question.publicId, updater)
                }
              />
            ))}
          </div>
        )}
      </div>

      <TrainingResultPanel answer={answerState.answer} version={version} />

      <div
        className={isReadonly ? "flex justify-end" : "grid grid-cols-2 gap-2"}
      >
        {isReadonly ? (
          <button
            className="border-border text-text-primary hover:bg-muted flex h-9 items-center justify-center rounded-lg border bg-transparent px-4 text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            type="button"
            onClick={onLoadReadonlySummary}
          >
            {answerState.pendingAction === "loading_result"
              ? "正在加载结果"
              : "查看结果"}
          </button>
        ) : (
          <>
            <button
              className="bg-secondary text-secondary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="button"
              onClick={onSaveDraft}
            >
              {answerState.pendingAction === "saving" ? "正在保存" : "保存草稿"}
            </button>
            <button
              className="bg-primary text-primary-foreground flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isPending}
              type="button"
              onClick={handleSubmitClick}
            >
              {answerState.pendingAction === "submitting" ? "正在提交" : "提交"}
            </button>
          </>
        )}
      </div>

      {isSubmitConfirming && !isReadonly ? (
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
              disabled={isPending}
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

      {answerState.feedback === null ? null : (
        <p
          aria-live={
            answerState.feedback.kind === "error" ? "assertive" : "polite"
          }
          className={
            answerState.feedback.kind === "error"
              ? "text-destructive text-sm"
              : "text-brand-primary text-sm"
          }
          role={answerState.feedback.kind === "error" ? "alert" : "status"}
        >
          {answerState.feedback.text}
        </p>
      )}
    </article>
  );
}

function QuestionAnswerField({
  answerItem,
  disabled,
  onChange,
  question,
}: {
  answerItem: AnswerItemFormValue;
  disabled: boolean;
  onChange: (
    updater: (value: AnswerItemFormValue) => AnswerItemFormValue,
  ) => void;
  question: OrganizationTrainingQuestionSnapshotDto;
}) {
  const inputName = `organization-training-${question.publicId}`;

  function handleSingleChoice(optionPublicId: string) {
    onChange((currentValue) => ({
      ...currentValue,
      selectedOptionPublicIds: [optionPublicId],
    }));
  }

  function handleMultipleChoice(optionPublicId: string, checked: boolean) {
    onChange((currentValue) => {
      const currentSelected = currentValue.selectedOptionPublicIds;
      const selectedOptionPublicIds = checked
        ? Array.from(new Set([...currentSelected, optionPublicId]))
        : currentSelected.filter((publicId) => publicId !== optionPublicId);

      return {
        ...currentValue,
        selectedOptionPublicIds,
      };
    });
  }

  return (
    <fieldset
      className="border-border bg-surface space-y-3 rounded-md border p-3 disabled:opacity-80"
      disabled={disabled}
    >
      <legend className="text-text-primary px-1 text-sm font-semibold">
        第 {question.sequenceNumber} 题 ·{" "}
        {getQuestionTypeLabel(question.questionType)} · {question.score} 分
      </legend>
      {question.materialTitle === null &&
      question.materialContent === null ? null : (
        <div className="bg-muted rounded-md p-3">
          {question.materialTitle === null ? null : (
            <p className="text-text-primary text-sm font-medium">
              {question.materialTitle}
            </p>
          )}
          {question.materialContent === null ? null : (
            <p className="text-text-secondary mt-1 text-sm leading-6">
              {question.materialContent}
            </p>
          )}
        </div>
      )}
      <p className="text-text-primary text-sm leading-6">{question.stem}</p>
      {question.questionType === "short_answer" ? (
        <label className="grid gap-2 text-sm font-medium">
          <span className="text-text-secondary">
            第 {question.sequenceNumber} 题作答
          </span>
          <textarea
            aria-label={`第 ${question.sequenceNumber} 题作答`}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 bg-surface min-h-24 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
            value={answerItem.textAnswer}
            onChange={(event) =>
              onChange((currentValue) => ({
                ...currentValue,
                textAnswer: event.target.value,
              }))
            }
          />
        </label>
      ) : (
        <div className="space-y-2">
          {question.options.map((option) => {
            const optionLabel = `${option.label}. ${option.content}`;
            const isChecked = answerItem.selectedOptionPublicIds.includes(
              option.publicId,
            );

            return (
              <label
                className="border-border bg-background flex items-start gap-2 rounded-md border px-3 py-2 text-sm transition-transform active:scale-[0.98]"
                key={option.publicId}
              >
                <input
                  aria-label={optionLabel}
                  checked={isChecked}
                  className="mt-1"
                  name={inputName}
                  type={
                    question.questionType === "multi_choice"
                      ? "checkbox"
                      : "radio"
                  }
                  onChange={(event) => {
                    if (question.questionType === "multi_choice") {
                      handleMultipleChoice(
                        option.publicId,
                        event.target.checked,
                      );
                      return;
                    }

                    handleSingleChoice(option.publicId);
                  }}
                />
                <span className="text-text-primary">{optionLabel}</span>
              </label>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}

function TrainingResultPanel({
  answer,
  version,
}: {
  answer: EmployeeOrganizationTrainingAnswerDto | null;
  version: OrganizationTrainingPublishedVersionDto;
}) {
  if (answer === null) {
    return (
      <section className="border-border rounded-md border p-3">
        <h3 className="text-text-primary text-sm font-medium">结果查看</h3>
        <p className="text-text-secondary mt-2 text-sm">
          提交后可查看自己的答案、得分、标准答案、解析和主观题评分点。
        </p>
      </section>
    );
  }

  const answerItems = answer.answerItems ?? [];
  const questionResults = answer.questionResults ?? [];

  return (
    <section className="border-border space-y-3 rounded-md border p-3">
      <h3 className="text-text-primary text-sm font-medium">结果查看</h3>
      {answer.scoreSummary === null ? (
        <p className="text-text-secondary text-sm">
          草稿已保存，提交后生成只读结果。
        </p>
      ) : (
        <p className="text-text-primary text-sm font-semibold">
          结果 {answer.scoreSummary.score} / {answer.scoreSummary.totalScore}
        </p>
      )}
      {answerItems.length === 0 ? null : (
        <div className="space-y-2">
          <p className="text-text-primary text-sm font-medium">我的答案</p>
          {answerItems.map((answerItem) => (
            <p
              className="text-text-secondary bg-muted rounded-md p-2 text-sm"
              key={answerItem.questionPublicId}
            >
              {formatAnswerItemDisplay(answerItem, version.questions ?? [])}
            </p>
          ))}
        </div>
      )}
      {questionResults.length === 0 ? null : (
        <div className="space-y-3">
          {questionResults.map((questionResult) => (
            <QuestionResultSummary
              key={questionResult.questionPublicId}
              questionResult={questionResult}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function QuestionResultSummary({
  questionResult,
}: {
  questionResult: EmployeeOrganizationTrainingQuestionResultDto;
}) {
  return (
    <div className="bg-muted space-y-2 rounded-md p-3">
      <p className="text-text-primary text-sm font-medium">
        题目得分 {questionResult.score} / {questionResult.maxScore}
      </p>
      {questionResult.standardAnswer === null ? null : (
        <p className="text-text-secondary text-sm">
          标准答案：{questionResult.standardAnswer}
        </p>
      )}
      {questionResult.analysis === null ? null : (
        <p className="text-text-secondary text-sm leading-6">
          {questionResult.analysis}
        </p>
      )}
      {questionResult.scoringPointResults.length === 0 ? null : (
        <div className="space-y-2">
          {questionResult.scoringPointResults.map((scoringPoint) => (
            <div
              className="border-border bg-surface rounded-md border p-2"
              key={scoringPoint.label}
            >
              <p className="text-text-primary text-sm font-medium">
                {scoringPoint.label}：{scoringPoint.score} /{" "}
                {scoringPoint.maxScore}
              </p>
              <p className="text-text-secondary mt-1 text-sm">
                {scoringPoint.reason}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatAnswerItemDisplay(
  answerItem: EmployeeOrganizationTrainingAnswerItemDto,
  questions: OrganizationTrainingQuestionSnapshotDto[],
): string {
  const question = questions.find(
    (candidate) => candidate.publicId === answerItem.questionPublicId,
  );

  if (answerItem.textAnswer !== null) {
    return answerItem.textAnswer;
  }

  if (question === undefined) {
    return answerItem.selectedOptionPublicIds.join("、");
  }

  const selectedLabels = question.options
    .filter((option) =>
      answerItem.selectedOptionPublicIds.includes(option.publicId),
    )
    .map((option) => `${option.label}. ${option.content}`);

  return selectedLabels.length > 0 ? selectedLabels.join("；") : "未作答";
}

function getAnswerStatusLabel(
  status: OrganizationTrainingPublishedVersionDto["employeeAnswerStatus"],
): string {
  if (status === "submitted" || status === "read_only") {
    return "已提交";
  }

  if (status === "in_progress") {
    return "进行中";
  }

  return "未开始";
}

function getQuestionTypeLabel(
  questionType: OrganizationTrainingQuestionSnapshotDto["questionType"],
): string {
  if (questionType === "single_choice") {
    return "单选题";
  }

  if (questionType === "multi_choice") {
    return "多选题";
  }

  if (questionType === "true_false") {
    return "判断题";
  }

  return "简答题";
}

function formatDateLabel(value: string | null | undefined): string {
  if (typeof value !== "string" || value.length < 10) {
    return "无固定截止";
  }

  return value.slice(0, 10);
}
