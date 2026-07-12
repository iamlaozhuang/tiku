"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { AdminDetailDrawer } from "@/components/admin/AdminDetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  PaperQuestionDto,
  PaperScoringPointDto,
  PaperSectionDto,
} from "@/server/contracts/paper-draft-contract";

import { FilterSelect } from "../content-admin-runtime";
import { createPaperQuestionUpdateInput } from "./paper-composer-model";

export type PaperQuestionEditorSubmitInput = ReturnType<
  typeof createPaperQuestionUpdateInput
>;

function stripRichText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function PaperComposerQuestionEditorDrawer({
  paperQuestion,
  paperSection,
  paperSections,
  onClose,
  onRemove,
  onSubmit,
}: {
  paperQuestion: PaperQuestionDto;
  paperSection: PaperSectionDto;
  paperSections: PaperSectionDto[];
  onClose: () => void;
  onRemove: () => Promise<boolean>;
  onSubmit: (input: PaperQuestionEditorSubmitInput) => Promise<boolean>;
}) {
  const [score, setScore] = useState(paperQuestion.score ?? "0.0");
  const [sortOrder, setSortOrder] = useState(String(paperQuestion.sortOrder));
  const [targetSection, setTargetSection] = useState(
    String(paperSection.sortOrder),
  );
  const [newSectionTitle, setNewSectionTitle] = useState("新的大题");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  const [scoringPoints, setScoringPoints] = useState<PaperScoringPointDto[]>(
    paperQuestion.scoringPoints,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supportsScoringPoints =
    paperQuestion.questionSnapshot.questionType === "short_answer" ||
    paperQuestion.questionSnapshot.questionType === "case_analysis" ||
    paperQuestion.questionSnapshot.questionType === "calculation" ||
    (paperQuestion.questionSnapshot.questionType === "fill_blank" &&
      paperQuestion.questionSnapshot.scoringMethod === "ai_scoring");

  function resolvePaperSection() {
    const existingSection = paperSections.find(
      (item) => item.sortOrder.toString() === targetSection,
    );
    if (existingSection !== undefined) {
      return {
        title: existingSection.title,
        description: existingSection.description,
        sortOrder: existingSection.sortOrder,
      };
    }

    return {
      title: newSectionTitle.trim(),
      description:
        newSectionDescription.trim() === ""
          ? null
          : newSectionDescription.trim(),
      sortOrder:
        Math.max(0, ...paperSections.map((item) => item.sortOrder)) + 1,
    };
  }

  async function handleSubmit() {
    const nextSection = resolvePaperSection();
    const scoreNumber = Number(score);
    const hasInvalidScoringPoint = scoringPoints.some(
      (item) =>
        item.description.trim() === "" ||
        !Number.isFinite(Number(item.score)) ||
        Number(item.score) < 0 ||
        Number(item.score) * 2 !== Math.round(Number(item.score) * 2),
    );
    if (
      nextSection.title === "" ||
      !Number.isFinite(scoreNumber) ||
      scoreNumber < 0 ||
      scoreNumber * 2 !== Math.round(scoreNumber * 2) ||
      !Number.isInteger(Number(sortOrder)) ||
      Number(sortOrder) < 1 ||
      hasInvalidScoringPoint
    ) {
      setErrorMessage("请检查大题、分值和题目顺序。分值按 0.5 递增。");
      return;
    }

    setIsSubmitting(true);
    const saved = await onSubmit(
      createPaperQuestionUpdateInput({
        paperSection: nextSection,
        score,
        sortOrder: Number(sortOrder),
        scoringPoints: scoringPoints.map((item, index) => ({
          ...item,
          description: item.description.trim(),
          sortOrder: index + 1,
        })),
      }),
    );
    setIsSubmitting(false);
    if (saved) onClose();
  }

  async function handleRemove() {
    setIsSubmitting(true);
    const removed = await onRemove();
    setIsSubmitting(false);
    if (removed) onClose();
  }

  const isGrouped = paperQuestion.questionGroupSortOrder !== null;
  return (
    <AdminDetailDrawer
      ariaLabel="编辑题目设置"
      description="这里只调整当前试卷内的分值、顺序、大题归属和评分点，不会修改题库母题。"
      eyebrow="试卷题目设置"
      title="编辑题目设置"
      onClose={onClose}
    >
      <div className="space-y-5">
        <section className="bg-muted/30 border-border rounded-md border p-4">
          <p className="text-text-primary text-sm font-medium">
            {stripRichText(paperQuestion.questionSnapshot.stemRichText) ||
              "未填写题干"}
          </p>
          <p className="text-text-secondary mt-2 text-xs">
            题干、选项、客观题答案和解析为加入试卷时的快照，此处只读。
          </p>
        </section>

        {isGrouped ? (
          <p className="bg-warning/10 border-warning/30 text-text-secondary rounded-md border p-3 text-sm">
            该题属于材料题组。切换大题时会移动整个材料题组，避免材料与子题分离。
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          <FilterSelect
            label="所属大题"
            options={[
              ...paperSections.map(
                (item) =>
                  [String(item.sortOrder), item.title] as [string, string],
              ),
              ["new", "新建大题"],
            ]}
            value={targetSection}
            onChange={setTargetSection}
          />
          <label className="grid gap-2 text-sm font-medium">
            <span className="text-text-secondary">题目分值</span>
            <Input
              aria-label="题目分值"
              min="0"
              step="0.5"
              type="number"
              value={score}
              onChange={(event) => setScore(event.target.value)}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span className="text-text-secondary">题目顺序</span>
            <Input
              aria-label="题目顺序"
              min="1"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </label>
        </div>

        {targetSection === "new" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              <span className="text-text-secondary">大题名称</span>
              <Input
                aria-label="大题名称"
                value={newSectionTitle}
                onChange={(event) => setNewSectionTitle(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              <span className="text-text-secondary">大题说明</span>
              <Input
                aria-label="大题说明"
                value={newSectionDescription}
                onChange={(event) =>
                  setNewSectionDescription(event.target.value)
                }
              />
            </label>
          </div>
        ) : null}

        {supportsScoringPoints ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-text-primary text-sm font-semibold">
                  本卷评分点
                </h3>
                <p className="text-text-secondary mt-1 text-xs">
                  仅影响当前试卷，不反向修改题库母题。
                </p>
              </div>
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() =>
                  setScoringPoints((items) => [
                    ...items,
                    {
                      description: "",
                      score: "0.5",
                      sortOrder: items.length + 1,
                    },
                  ])
                }
              >
                <Plus aria-hidden="true" data-icon="inline-start" />
                添加评分点
              </Button>
            </div>
            {scoringPoints.length === 0 ? (
              <p className="text-text-secondary text-sm">
                当前题目没有评分点。
              </p>
            ) : null}
            {scoringPoints.map((item, index) => (
              <div
                className="grid gap-2 md:grid-cols-[minmax(0,1fr)_8rem_2.25rem]"
                key={`${item.sortOrder}-${index}`}
              >
                <Input
                  aria-label={`评分点 ${index + 1} 描述`}
                  value={item.description}
                  onChange={(event) =>
                    setScoringPoints((items) =>
                      items.map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, description: event.target.value }
                          : candidate,
                      ),
                    )
                  }
                />
                <Input
                  aria-label={`评分点 ${index + 1} 分值`}
                  min="0"
                  step="0.5"
                  type="number"
                  value={item.score}
                  onChange={(event) =>
                    setScoringPoints((items) =>
                      items.map((candidate, candidateIndex) =>
                        candidateIndex === index
                          ? { ...candidate, score: event.target.value }
                          : candidate,
                      ),
                    )
                  }
                />
                <Button
                  aria-label={`删除评分点 ${index + 1}`}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setScoringPoints((items) =>
                      items.filter(
                        (_, candidateIndex) => candidateIndex !== index,
                      ),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            ))}
          </section>
        ) : (
          <p className="text-text-secondary text-sm">
            该题型的答案与评分方式来自题库快照，本卷不单独设置评分点。
          </p>
        )}

        {errorMessage === null ? null : (
          <p className="text-destructive text-sm" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="border-border flex flex-wrap justify-between gap-2 border-t pt-4">
          <Button
            disabled={isSubmitting}
            type="button"
            variant="destructive"
            onClick={() => void handleRemove()}
          >
            移出试卷
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button
              disabled={isSubmitting}
              type="button"
              onClick={() => void handleSubmit()}
            >
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </AdminDetailDrawer>
  );
}
