import { describe, expect, it } from "vitest";

import {
  createOrganizationTrainingAggregateMetrics,
  rankOrganizationTrainingEmployeeSummaries,
  selectHistoricalOrganizationTrainingVersionPublicIds,
} from "./organization-analytics";

describe("organization analytics aggregate metrics", () => {
  it("calculates completion, score, and submitted trend from official submissions", () => {
    const metrics = createOrganizationTrainingAggregateMetrics({
      eligibleEmployeePublicIds: [
        "employee_public_a",
        "employee_public_b",
        "employee_public_c",
      ],
      officialSubmissions: [
        {
          employeePublicId: "employee_public_a",
          score: 82,
          totalScore: 100,
          submittedAt: "2026-06-10T09:30:00Z",
        },
        {
          employeePublicId: "employee_public_b",
          score: 91,
          totalScore: 100,
          submittedAt: "2026-06-10T11:00:00Z",
        },
        {
          employeePublicId: "employee_public_c",
          score: 77,
          totalScore: 100,
          submittedAt: "2026-06-13T08:00:00Z",
        },
      ],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
    });

    expect(metrics).toEqual({
      eligibleEmployeeCount: 3,
      submittedEmployeeCount: 2,
      unfinishedEmployeeCount: 1,
      completionRate: 2 / 3,
      averageScore: 86.5,
      maxScore: 91,
      minScore: 82,
      submittedTrend: [{ date: "2026-06-10", submittedCount: 2 }],
    });
  });

  it("returns zero completion and null score summaries for empty inputs", () => {
    const metrics = createOrganizationTrainingAggregateMetrics({
      eligibleEmployeePublicIds: [],
      officialSubmissions: [],
      dateRange: {
        startAt: "2026-06-10T00:00:00Z",
        endAt: "2026-06-12T23:59:59Z",
      },
    });

    expect(metrics).toEqual({
      eligibleEmployeeCount: 0,
      submittedEmployeeCount: 0,
      unfinishedEmployeeCount: 0,
      completionRate: 0,
      averageScore: null,
      maxScore: null,
      minScore: null,
      submittedTrend: [],
    });
  });

  it("keeps taken_down versions in historical aggregate selection", () => {
    expect(
      selectHistoricalOrganizationTrainingVersionPublicIds([
        {
          trainingVersionPublicId: "training_version_public_published",
          status: "published",
        },
        {
          trainingVersionPublicId: "training_version_public_taken_down",
          status: "taken_down",
        },
      ]),
    ).toEqual([
      "training_version_public_published",
      "training_version_public_taken_down",
    ]);
  });

  it("sorts employee training rankings by score, completion, and earliest latest submission", () => {
    const rankedRows = rankOrganizationTrainingEmployeeSummaries([
      {
        employeePublicId: "employee_public_lower_completion",
        trainingAverageScore: 90,
        trainingCompletionRate: 0.5,
        latestTrainingSubmittedAt: "2026-06-11T08:00:00Z",
      },
      {
        employeePublicId: "employee_public_later_submission",
        trainingAverageScore: 90,
        trainingCompletionRate: 0.8,
        latestTrainingSubmittedAt: "2026-06-11T09:00:00Z",
      },
      {
        employeePublicId: "employee_public_first",
        trainingAverageScore: 90,
        trainingCompletionRate: 0.8,
        latestTrainingSubmittedAt: "2026-06-10T09:00:00Z",
      },
      {
        employeePublicId: "employee_public_null_score",
        trainingAverageScore: null,
        trainingCompletionRate: 1,
        latestTrainingSubmittedAt: null,
      },
    ]);

    expect(rankedRows.map((row) => row.employeePublicId)).toEqual([
      "employee_public_first",
      "employee_public_later_submission",
      "employee_public_lower_completion",
      "employee_public_null_score",
    ]);
  });
});
