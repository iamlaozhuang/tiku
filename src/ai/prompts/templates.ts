import type { AiFuncType } from "@/server/models/ai-rag";

export type PromptTemplateDefinition = {
  promptTemplateKey: string;
  aiFuncType: AiFuncType;
  version: number;
  templateContent: string;
  templateHash: string;
  requiredVariables: string[];
  isActive: boolean;
};

export const promptTemplateDefinitions: PromptTemplateDefinition[] = [
  {
    promptTemplateKey: "ai_scoring_v1",
    aiFuncType: "scoring",
    version: 1,
    templateContent:
      "Score the student answer using the question, scoring points, standard answer, and authorized RAG context. Return only the approved structured scoring result.",
    templateHash: "ai_scoring_v1_baseline",
    requiredVariables: [
      "question",
      "studentAnswer",
      "scoringPoints",
      "ragContext",
    ],
    isActive: true,
  },
  {
    promptTemplateKey: "ai_explanation_v1",
    aiFuncType: "explanation",
    version: 1,
    templateContent:
      "Explain the question using the standard answer, teacher analysis, learner answer, and authorized RAG context. Do not fabricate citations.",
    templateHash: "ai_explanation_v1_baseline",
    requiredVariables: [
      "question",
      "standardAnswer",
      "analysis",
      "learnerAnswer",
      "ragContext",
    ],
    isActive: true,
  },
  {
    promptTemplateKey: "ai_hint_v1",
    aiFuncType: "hint",
    version: 1,
    templateContent:
      "Give improvement guidance for the subjective answer without directly revealing the final answer. Use authorized RAG context only.",
    templateHash: "ai_hint_v1_baseline",
    requiredVariables: ["question", "studentAnswer", "scoringPoints"],
    isActive: true,
  },
  {
    promptTemplateKey: "kn_recommendation_v1",
    aiFuncType: "kn_recommendation",
    version: 1,
    templateContent:
      "Recommend zero to five knowledge nodes for the question from the current knowledge tree. Return empty results when the tree is empty.",
    templateHash: "kn_recommendation_v1_baseline",
    requiredVariables: ["question", "profession", "level", "knowledgeTree"],
    isActive: true,
  },
  {
    promptTemplateKey: "learning_suggestion_v1",
    aiFuncType: "learning_suggestion",
    version: 1,
    templateContent:
      "Create learning suggestions from the exam report snapshot, answer record summary, and knowledge node snapshot without recalculating historical reports.",
    templateHash: "learning_suggestion_v1_baseline",
    requiredVariables: [
      "examReport",
      "answerRecordSummary",
      "knowledgeNodeSnapshot",
    ],
    isActive: true,
  },
];

export const promptTemplateKeysByFuncType: Record<AiFuncType, string> = {
  scoring: "ai_scoring_v1",
  explanation: "ai_explanation_v1",
  hint: "ai_hint_v1",
  kn_recommendation: "kn_recommendation_v1",
  learning_suggestion: "learning_suggestion_v1",
};
