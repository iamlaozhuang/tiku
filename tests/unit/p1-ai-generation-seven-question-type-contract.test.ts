import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import {
  aiGenerationQuestionTypeValues,
  parseCurrentAiGenerationQuestionType,
  parseLegacyAiGenerationQuestionType,
} from "../../src/server/services/ai-generation-question-type-contract";
import { organizationTrainingQuestionTypeValues } from "../../src/server/models/organization-training";
import { questionTypeValues } from "../../src/server/models/paper";
import {
  promptTemplateDefinitions,
  promptTemplateKeysByFuncType,
} from "../../src/ai/prompts/templates";

const canonicalQuestionTypes = [
  "single_choice",
  "multi_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "case_analysis",
  "calculation",
] as const;

function readWorkspaceFile(path: string): string {
  return readFileSync(path, "utf8");
}

function parseYamlStrictly(path: string): unknown {
  const repositoryRequire = createRequire(import.meta.url);
  const viteRequire = createRequire(
    repositoryRequire.resolve("vite/package.json"),
  );
  const { parseDocument } = viteRequire("yaml") as {
    parseDocument: (
      source: string,
      options: { strict: boolean; uniqueKeys: boolean },
    ) => { errors: unknown[]; toJS: () => unknown };
  };
  const document = parseDocument(readWorkspaceFile(path), {
    strict: true,
    uniqueKeys: true,
  });
  expect(document.errors).toEqual([]);
  return document.toJS();
}

describe("P1 F-0157 seven question type contract", () => {
  it("keeps one canonical seven-value identity across formal and organization boundaries", () => {
    expect(questionTypeValues).toEqual(canonicalQuestionTypes);
    expect(aiGenerationQuestionTypeValues).toEqual(canonicalQuestionTypes);
    expect(organizationTrainingQuestionTypeValues).toEqual(
      canonicalQuestionTypes,
    );
    expect(
      canonicalQuestionTypes.map(parseCurrentAiGenerationQuestionType),
    ).toEqual(canonicalQuestionTypes);
  });

  it("limits aliases to the explicit legacy parser and never accepts variants", () => {
    expect(parseLegacyAiGenerationQuestionType("multiple_choice")).toBe(
      "multi_choice",
    );
    expect(parseLegacyAiGenerationQuestionType("subjective")).toBe(
      "short_answer",
    );
    for (const value of [
      "multiple_choice",
      "subjective",
      "judge",
      " SINGLE_CHOICE",
      "single_choice ",
      "单选题",
      "unknown",
    ]) {
      expect(parseCurrentAiGenerationQuestionType(value)).toBeNull();
    }
  });

  it("preserves paper v1 provenance while governance selects only paper v2", () => {
    const paperV1 = promptTemplateDefinitions.find(
      (definition) => definition.promptTemplateKey === "ai_paper_generation_v1",
    );
    const paperV2 = promptTemplateDefinitions.find(
      (definition) => definition.promptTemplateKey === "ai_paper_generation_v2",
    );

    expect(paperV1).toMatchObject({ version: 1, isActive: false });
    expect(paperV2).toMatchObject({ version: 2, isActive: true });
    expect(promptTemplateKeysByFuncType.ai_paper_generation).toBe(
      "ai_paper_generation_v2",
    );
    expect(paperV2?.templateContent).toContain(
      canonicalQuestionTypes.join("、"),
    );
  });

  it("keeps new UI and request emitters free of legacy aliases and four-type defaults", () => {
    for (const path of [
      "src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx",
      "src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx",
      "src/server/services/admin-ai-generation-local-contract-route.ts",
    ]) {
      const source = readWorkspaceFile(path);
      expect(source).not.toMatch(/\b(?:multiple_choice|judge|subjective)\b/u);
    }
    expect(
      readWorkspaceFile(
        "src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx",
      ),
    ).not.toContain('generationKind === "paper" ? "balanced_40_30_30"');
  });

  it("routes every review-required training type through the same scoring boundary", () => {
    const serviceSource = readWorkspaceFile(
      "src/server/services/organization-training-service.ts",
    );
    const routeSource = readWorkspaceFile(
      "src/server/services/organization-training-route.ts",
    );
    const personalLearningSource = readWorkspaceFile(
      "src/server/services/personal-ai-generation-learning-session-service.ts",
    );
    expect(serviceSource).toMatch(
      /shortAnswerQuestionPublicIds:[\s\S]{0,400}isAiGenerationReviewRequiredQuestionType/u,
    );
    expect(serviceSource).toMatch(
      /shortAnswerItems:[\s\S]{0,500}isAiGenerationReviewRequiredQuestionType/u,
    );
    expect(serviceSource).not.toMatch(
      /shortAnswerQuestionPublicIds:[\s\S]{0,400}question\.questionType === "short_answer"/u,
    );
    expect(routeSource).toMatch(
      /requiresAiScoring[\s\S]{0,200}isAiGenerationReviewRequiredQuestionType/u,
    );
    expect(routeSource).not.toMatch(
      /requiresAiScoring[\s\S]{0,200}question\.questionType === "short_answer"/u,
    );
    expect(personalLearningSource).toContain(
      "isAiGenerationReviewRequiredQuestionType",
    );
  });

  it("fails the whole publish preview instead of filtering malformed choice options", () => {
    const pageSource = readWorkspaceFile(
      "src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx",
    );
    const normalizerSource = pageSource.match(
      /function normalizePublishQuestionFormValue\([\s\S]+?\n\}\n\nfunction normalizePublishQuestionFormValues/u,
    )?.[0];

    expect(normalizerSource).toBeDefined();
    expect(normalizerSource).not.toContain(".filter(");
    expect(normalizerSource).toContain("options.some");
  });

  it("keeps current personal parameter callers strict and the legacy alias edge explicit", () => {
    for (const path of [
      "src/server/mappers/personal-ai-generation-request-mapper.ts",
      "src/server/validators/personal-ai-generation-request.ts",
      "src/server/services/admin-ai-generation-local-contract-route.ts",
    ]) {
      expect(readWorkspaceFile(path)).toContain(
        "parseCurrentAiGenerationQuestionType",
      );
      expect(readWorkspaceFile(path)).not.toContain(
        "parseLegacyAiGenerationQuestionType",
      );
    }
    expect(
      readWorkspaceFile(
        "src/server/repositories/admin-ai-generation-result-persistence-repository.ts",
      ),
    ).toContain("parseLegacyAiGenerationQuestionType");
  });

  it("keeps the approved task free of DDL or migration paths", () => {
    const taskSafety = JSON.parse(
      readWorkspaceFile("docs/04-agent-system/state/task-safety.json"),
    ) as {
      taskId: string;
      baseSha: string;
      approvalId: string;
      amendmentApprovalId: string;
      previousFinalTreeCorrectionDecision: string;
      finalTreeCorrectionDecision: string;
      allowedFiles: string[];
    };

    expect(taskSafety).toMatchObject({
      taskId:
        "p1-remediation-rc-08-ai-generation-seven-question-type-contract-2026-07-23",
      baseSha: "14c1575faa8fba3ea43a12f8b0c0d862b1595713",
      approvalId:
        "guardian-f0157-ai-generation-seven-question-type-contract-2026-07-23",
      amendmentApprovalId:
        "guardian-f0157-canonical-generation-parameter-callers-amendment-02-2026-07-23",
      previousFinalTreeCorrectionDecision:
        "P1_GUARDIAN_CORRECTION_REQUIRED_V1_rejected_tree_cd5a723851e9343910966b4f216d8ea9fb97d604",
      finalTreeCorrectionDecision:
        "P1_GUARDIAN_CORRECTION_REQUIRED_V1_rejected_tree_f29a7b7ea5318c9c548e05d0c71a4109232d77c2",
    });
    expect(taskSafety.allowedFiles).toHaveLength(72);
    expect(
      taskSafety.allowedFiles.some((path) => path.startsWith("drizzle/")),
    ).toBe(false);
  });

  it("strictly parses the F-0157 task contract and WIP state", () => {
    const taskId =
      "p1-remediation-rc-08-ai-generation-seven-question-type-contract-2026-07-23";
    const branch = "fix/ai-generation-seven-question-type-contract";
    const baseSha = "14c1575faa8fba3ea43a12f8b0c0d862b1595713";
    const approvalId =
      "guardian-f0157-ai-generation-seven-question-type-contract-2026-07-23";
    const taskSafety = JSON.parse(
      readWorkspaceFile("docs/04-agent-system/state/task-safety.json"),
    ) as {
      taskId: string;
      branch: string;
      baseSha: string;
      status: string;
      approvalId: string;
      allowedFiles: string[];
      coreFiles: string[];
      contingencyFiles: string[];
      conditionalCloseout: { approved: boolean; approvalId: string };
    };
    expect(taskSafety).toMatchObject({
      taskId,
      branch,
      baseSha,
      approvalId,
      conditionalCloseout: { approved: true, approvalId },
    });
    expect(taskSafety.allowedFiles).toHaveLength(72);
    expect(taskSafety.coreFiles).toHaveLength(46);
    expect(taskSafety.contingencyFiles).toHaveLength(26);
    expect(new Set(taskSafety.allowedFiles).size).toBe(72);
    expect(taskSafety.allowedFiles).toEqual([
      ...taskSafety.coreFiles,
      ...taskSafety.contingencyFiles,
    ]);

    const projectState = parseYamlStrictly(
      "docs/04-agent-system/state/project-state.yaml",
    ) as {
      currentTask: {
        id: string;
        branch: string;
        status: string;
        executionStage: string;
        riskBoundary: {
          approvedBaseSha: string;
          approvalId: string;
          approvedAllowedFiles: number;
          previousFinalTreeCorrectionDecision: string;
          finalTreeCorrectionDecision: string;
        };
      };
    };
    const taskQueue = parseYamlStrictly(
      "docs/04-agent-system/state/task-queue.yaml",
    ) as {
      activeTasks: Array<{
        id: string;
        branch: string;
        status: string;
        executionStage: string;
        riskBoundary: {
          approvedBaseSha: string;
          approvalId: string;
          approvedAllowedFiles: number;
          previousFinalTreeCorrectionDecision: string;
          finalTreeCorrectionDecision: string;
        };
      }>;
    };
    const expectedTask = expect.objectContaining({
      id: taskId,
      branch,
      status: "in_progress",
      executionStage: taskSafety.status,
      riskBoundary: expect.objectContaining({
        approvedBaseSha: baseSha,
        approvalId,
        approvedAllowedFiles: 72,
        previousFinalTreeCorrectionDecision:
          "P1_GUARDIAN_CORRECTION_REQUIRED_V1_rejected_tree_cd5a723851e9343910966b4f216d8ea9fb97d604",
        finalTreeCorrectionDecision:
          "P1_GUARDIAN_CORRECTION_REQUIRED_V1_rejected_tree_f29a7b7ea5318c9c548e05d0c71a4109232d77c2",
      }),
    });
    expect(projectState.currentTask).toEqual(expectedTask);
    expect(
      taskQueue.activeTasks.filter((task) => task.status === "in_progress"),
    ).toEqual([expectedTask]);
  });
});
