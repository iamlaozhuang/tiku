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

type AnswerUiState = {
  answer: EmployeeOrganizationTrainingAnswerDto | null;
  message: string | null;
  values: AnswerFormValues;
};

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

function isStudentAccessDeniedResponse(payload: { code: number }): boolean {
  return (
    (payload.code >= 403000 && payload.code < 404000) || payload.code === 409076
  );
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
    message: null,
    values: createInitialAnswerValues(version),
  };
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

  async function handleSaveDraft(
    version: OrganizationTrainingPublishedVersionDto,
  ) {
    const sessionValue = readStudentSessionRequestToken();
    const trainingVersionPublicId = version.publicId;

    const currentState =
      answerStateByVersionPublicId[trainingVersionPublicId] ??
      createInitialAnswerState(version);
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

  async function handleSubmit(
    version: OrganizationTrainingPublishedVersionDto,
  ) {
    const sessionValue = readStudentSessionRequestToken();
    const trainingVersionPublicId = version.publicId;

    const currentState =
      answerStateByVersionPublicId[trainingVersionPublicId] ??
      createInitialAnswerState(version);
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
              createInitialAnswerState(version)
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
            onSaveDraft={() => void handleSaveDraft(version)}
            onSubmit={() => void handleSubmit(version)}
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
  const organizationName = version.organizationName ?? "当前组织节点";
  const answerStatusLabel = getAnswerStatusLabel(version.employeeAnswerStatus);

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
          已作答 {answeredQuestionCount} / {version.questionCount}{" "}
          题，提交前可保存草稿。
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
    </article>
  );
}

function QuestionAnswerField({
  answerItem,
  onChange,
  question,
}: {
  answerItem: AnswerItemFormValue;
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
    <fieldset className="border-border bg-surface space-y-3 rounded-md border p-3">
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
