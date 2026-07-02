import { describe, expect, it } from "vitest";

import { createRouteIntegratedProviderInstruction } from "./route-integrated-provider-instruction-service";
import type { AiGenerationRouteIntegratedGroundingContext } from "../contracts/route-integrated-provider-execution-contract";

function createGroundingContext(
  questionCount: number,
): AiGenerationRouteIntegratedGroundingContext {
  return {
    generationParameters: {
      profession: "marketing",
      level: 3,
      subject: "theory",
      knowledgeNode: "synthetic knowledge node",
      questionType: "single_choice",
      questionCount,
      difficulty: "medium",
      learningObjective: "synthetic learning objective",
    },
    evidenceStatus: "sufficient",
    citationCount: 1,
    citations: [
      {
        resourceTitle: "synthetic resource title",
        headingPath: ["synthetic heading"],
        chunkIndex: 0,
        chunkText: "synthetic bounded grounding evidence",
        score: 0.92,
      },
    ],
  };
}

function readOutputContractLine(instruction: string): string | undefined {
  return instruction.split("\n").find((line) => line.startsWith("输出 JSON"));
}

describe("route-integrated Provider instruction service", () => {
  it.each([5, 10])(
    "builds the shared AI question instruction with requested count %i",
    (questionCount) => {
      const instruction = createRouteIntegratedProviderInstruction({
        taskType: "ai_question_generation",
        sceneLabel: "内容草稿评审 AI出题",
        draftInstruction: "不要写入正式题库；输出可读的草稿摘要和关键检查点。",
        groundingContext: createGroundingContext(questionCount),
      });

      expect(instruction).toContain("内容草稿评审 AI出题");
      expect(readOutputContractLine(instruction)).toContain("questions");
      expect(readOutputContractLine(instruction)).toContain(
        "仅输出一个 JSON 对象",
      );
      expect(readOutputContractLine(instruction)).toContain(
        "顶层必须只使用 questions 字段",
      );
      expect(readOutputContractLine(instruction)).toContain(
        "不要输出 Markdown",
      );
      expect(readOutputContractLine(instruction)).toContain("不得输出完整题干");
      expect(readOutputContractLine(instruction)).toContain("选项、答案或解析");
      expect(readOutputContractLine(instruction)).toContain(
        `${questionCount} 条`,
      );
      expect(instruction).toContain("仅依据下列资料片段生成");
      expect(instruction).toContain("资料片段1");
      expect(instruction).not.toContain("rawPrompt");
      expect(instruction).not.toContain("providerPayload");
      expect(instruction).not.toContain("Authorization");
      expect(instruction).not.toContain("localStorage");
    },
  );

  it("builds the shared AI paper instruction with total question count fields", () => {
    const instruction = createRouteIntegratedProviderInstruction({
      taskType: "ai_paper_generation",
      sceneLabel: "个人训练 AI组卷",
      draftInstruction: "不要引用真实题目全文；输出可读的组卷草稿摘要。",
      groundingContext: createGroundingContext(50),
    });

    expect(instruction).toContain("个人训练 AI组卷");
    expect(readOutputContractLine(instruction)).toContain("paperSections");
    expect(readOutputContractLine(instruction)).toContain(
      "questionTypeDistribution",
    );
    expect(readOutputContractLine(instruction)).toContain("knowledgeCoverage");
    expect(readOutputContractLine(instruction)).toContain("totalQuestionCount");
    expect(readOutputContractLine(instruction)).toContain("50");
    expect(instruction).toContain("仅依据下列资料片段生成");
  });

  it("keeps scene wording variable while sharing output contract wording", () => {
    const groundingContext = createGroundingContext(20);
    const adminInstruction = createRouteIntegratedProviderInstruction({
      taskType: "ai_paper_generation",
      sceneLabel: "内容草稿评审 AI组卷",
      draftInstruction: "不要写入正式题库；输出可读的草稿摘要和关键检查点。",
      groundingContext,
    });
    const personalInstruction = createRouteIntegratedProviderInstruction({
      taskType: "ai_paper_generation",
      sceneLabel: "个人训练 AI组卷",
      draftInstruction: "不要引用真实题目全文；输出可读的要点或小练习草稿。",
      groundingContext,
    });

    expect(adminInstruction).toContain("内容草稿评审 AI组卷");
    expect(personalInstruction).toContain("个人训练 AI组卷");
    expect(readOutputContractLine(adminInstruction)).toBe(
      readOutputContractLine(personalInstruction),
    );
  });
});
