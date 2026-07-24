import { describe, expect, it } from "vitest";

import {
  AI_CALL_TOKEN_ESTIMATION_METHOD,
  createEstimatedAiCallObservation,
  createProviderReportedAiCallObservation,
  createSuccessfulAiCallObservation,
  createUnavailableAiCallObservation,
  measureClientObservedLatency,
  normalizeAiCallObservation,
  normalizeProviderTokenUsageAtAdapterEdge,
} from "./ai-call-observation";

describe("AI call observation v1", () => {
  it("accepts exact provider usage and rejects partial, conflicting, or overflowing facts", () => {
    expect(
      createProviderReportedAiCallObservation({
        usage: {
          inputTokenCount: 11,
          outputTokenCount: 7,
          totalTokenCount: 18,
        },
        latency: { source: "provider_reported", latencyMs: 23 },
      }),
    ).toEqual({
      schemaVersion: 1,
      tokenSource: "provider_reported",
      tokenEstimationMethod: null,
      promptTokenCount: 11,
      completionTokenCount: 7,
      totalTokenCount: 18,
      latencySource: "provider_reported",
      latencyMs: 23,
    });
    expect(
      createProviderReportedAiCallObservation({
        usage: {
          inputTokenCount: 2_147_483_647,
          outputTokenCount: 0,
          totalTokenCount: 2_147_483_647,
        },
        latency: {
          source: "client_observed",
          latencyMs: 2_147_483_647,
        },
      }),
    ).toMatchObject({
      promptTokenCount: 2_147_483_647,
      completionTokenCount: 0,
      totalTokenCount: 2_147_483_647,
      latencyMs: 2_147_483_647,
    });

    for (const usage of [
      { inputTokenCount: 1, outputTokenCount: 2 },
      { inputTokenCount: 1, outputTokenCount: 2, totalTokenCount: 4 },
      { inputTokenCount: -1, outputTokenCount: 2, totalTokenCount: 1 },
      { inputTokenCount: 1.5, outputTokenCount: 2, totalTokenCount: 3.5 },
      {
        inputTokenCount: Number.POSITIVE_INFINITY,
        outputTokenCount: 2,
        totalTokenCount: 3,
      },
      {
        inputTokenCount: 2_147_483_647,
        outputTokenCount: 1,
        totalTokenCount: 2_147_483_648,
      },
      { inputTokenCount: 1, outputTokenCount: 2, totalTokenCount: 3, extra: 0 },
    ]) {
      expect(() =>
        Reflect.apply(createProviderReportedAiCallObservation, undefined, [
          {
            usage,
            latency: { source: "client_observed", latencyMs: 4 },
          },
        ]),
      ).toThrow();
    }
  });

  it("normalizes one Provider alias family only at the adapter edge", () => {
    expect(
      normalizeProviderTokenUsageAtAdapterEdge({
        prompt_tokens: 3,
        completion_tokens: 5,
        total_tokens: 8,
      }),
    ).toEqual({ inputTokenCount: 3, outputTokenCount: 5, totalTokenCount: 8 });
    expect(
      normalizeProviderTokenUsageAtAdapterEdge({
        input_tokens: 3,
        output_tokens: 5,
        total_tokens: 8,
      }),
    ).toEqual({ inputTokenCount: 3, outputTokenCount: 5, totalTokenCount: 8 });
    expect(
      normalizeProviderTokenUsageAtAdapterEdge({
        inputTokens: 3,
        outputTokens: 5,
        totalTokens: 8,
      }),
    ).toEqual({ inputTokenCount: 3, outputTokenCount: 5, totalTokenCount: 8 });
    expect(
      normalizeProviderTokenUsageAtAdapterEdge({
        inputTokenCount: 3,
        outputTokenCount: 5,
        totalTokenCount: 8,
      }),
    ).toEqual({ inputTokenCount: 3, outputTokenCount: 5, totalTokenCount: 8 });
    expect(
      normalizeProviderTokenUsageAtAdapterEdge({ inputTokens: 3 }),
    ).toBeNull();

    expect(() =>
      normalizeProviderTokenUsageAtAdapterEdge({
        prompt_tokens: 3,
        input_tokens: 3,
        completion_tokens: 5,
        total_tokens: 8,
      }),
    ).toThrow();
    expect(() =>
      normalizeProviderTokenUsageAtAdapterEdge({
        inputTokens: 3,
        outputTokens: 5,
        totalTokens: 8,
        total_tokens: 8,
      }),
    ).toThrow();
    expect(() =>
      normalizeProviderTokenUsageAtAdapterEdge({
        inputTokens: 3,
        outputTokens: 5,
        totalTokens: 9,
      }),
    ).toThrow();
    expect(() =>
      normalizeProviderTokenUsageAtAdapterEdge(Object.create({})),
    ).toThrow();
  });

  it("estimates the complete canonical request and response with an explicit method", () => {
    const short = createEstimatedAiCallObservation({
      request: { question: "a", rag: [], scoringPoints: [] },
      response: { answer: "b", structured: [] },
      latency: { source: "client_observed", latencyMs: 7 },
    });
    const complete = createEstimatedAiCallObservation({
      request: {
        question: "a",
        rag: [{ title: "evidence", content: "long evidence text" }],
        scoringPoints: [{ label: "point one" }, { label: "point two" }],
      },
      response: { answer: "b", structured: [{ reason: "long result reason" }] },
      latency: { source: "client_observed", latencyMs: 7 },
    });

    expect(short.tokenSource).toBe("estimated");
    expect(short.tokenEstimationMethod).toBe(AI_CALL_TOKEN_ESTIMATION_METHOD);
    expect(complete.promptTokenCount).toBeGreaterThan(short.promptTokenCount!);
    expect(complete.completionTokenCount).toBeGreaterThan(
      short.completionTokenCount!,
    );
    expect(
      createEstimatedAiCallObservation({
        request: { z: "last", a: "first" },
        response: { nested: { z: 2, a: 1 } },
        latency: { source: "client_observed", latencyMs: 7 },
      }),
    ).toEqual(
      createEstimatedAiCallObservation({
        request: { a: "first", z: "last" },
        response: { nested: { a: 1, z: 2 } },
        latency: { source: "client_observed", latencyMs: 7 },
      }),
    );
    expect(() =>
      createEstimatedAiCallObservation({
        request: Array(2),
        response: {},
        latency: { source: "client_observed", latencyMs: 7 },
      }),
    ).toThrow();
    expect(() =>
      createEstimatedAiCallObservation({
        request: new Date("2026-07-23T00:00:00.000Z"),
        response: {},
        latency: { source: "client_observed", latencyMs: 7 },
      }),
    ).toThrow();
    expect(() =>
      createEstimatedAiCallObservation({
        request: { invalid: Number.NaN },
        response: {},
        latency: { source: "client_observed", latencyMs: 7 },
      }),
    ).toThrow();
  });

  it("selects one truthful success observation without accepting partial Provider facts", () => {
    expect(
      createSuccessfulAiCallObservation({
        providerUsage: {
          inputTokenCount: 3,
          outputTokenCount: 5,
          totalTokenCount: 8,
        },
        providerLatencyMs: 12,
        clientLatencyMs: 15,
        serializedProviderRequest: { prompt: "complete" },
        normalizedProviderResponse: { result: "ok" },
      }),
    ).toMatchObject({
      tokenSource: "provider_reported",
      latencySource: "provider_reported",
      totalTokenCount: 8,
      latencyMs: 12,
    });

    expect(
      createSuccessfulAiCallObservation({
        providerUsage: null,
        providerLatencyMs: 2_147_483_648,
        clientLatencyMs: 15,
        serializedProviderRequest: { prompt: "complete" },
        normalizedProviderResponse: { result: "ok" },
      }),
    ).toMatchObject({
      tokenSource: "estimated",
      tokenEstimationMethod: AI_CALL_TOKEN_ESTIMATION_METHOD,
      latencySource: "client_observed",
      latencyMs: 15,
    });

    expect(
      createSuccessfulAiCallObservation({
        providerUsage: null,
        providerLatencyMs: undefined,
        clientLatencyMs: 15,
        serializedProviderRequest: null,
        normalizedProviderResponse: { result: "ok" },
      }),
    ).toEqual({
      schemaVersion: 1,
      tokenSource: "unavailable",
      tokenEstimationMethod: null,
      promptTokenCount: null,
      completionTokenCount: null,
      totalTokenCount: null,
      latencySource: "client_observed",
      latencyMs: 15,
    });

    expect(() =>
      Reflect.apply(createSuccessfulAiCallObservation, undefined, [
        {
          providerUsage: {
            prompt_tokens: 3,
            completion_tokens: 5,
            total_tokens: 8,
          },
          providerLatencyMs: undefined,
          clientLatencyMs: 15,
          serializedProviderRequest: { prompt: "complete" },
          normalizedProviderResponse: { result: "ok" },
        },
      ]),
    ).toThrow();
  });

  it("keeps unavailable facts explicit and rejects partial current observations", () => {
    expect(createUnavailableAiCallObservation()).toEqual({
      schemaVersion: 1,
      tokenSource: "unavailable",
      tokenEstimationMethod: null,
      promptTokenCount: null,
      completionTokenCount: null,
      totalTokenCount: null,
      latencySource: "unavailable",
      latencyMs: null,
    });

    expect(() =>
      normalizeAiCallObservation({
        ...createUnavailableAiCallObservation(),
        promptTokenCount: 0,
      }),
    ).toThrow();
    expect(() =>
      normalizeAiCallObservation({
        ...createUnavailableAiCallObservation(),
        latencySource: "client_observed",
      }),
    ).toThrow();
    expect(() =>
      normalizeAiCallObservation({
        ...createUnavailableAiCallObservation(),
        unknown: true,
      }),
    ).toThrow();
    expect(() =>
      createUnavailableAiCallObservation({ latencyMs: Number.NaN }),
    ).toThrow();
    expect(measureClientObservedLatency(100.1, 101.01)).toBe(1);
    expect(() => measureClientObservedLatency(2, 1)).toThrow();
    expect(() => measureClientObservedLatency(100.1, 100)).toThrow();
    expect(() => measureClientObservedLatency(Number.NaN, 100.1)).toThrow();
    expect(() =>
      measureClientObservedLatency(100.1, Number.POSITIVE_INFINITY),
    ).toThrow();
    const zeroDuration = measureClientObservedLatency(100.1, 100.1);
    expect(zeroDuration).toBe(0);
    expect(Object.is(zeroDuration, -0)).toBe(false);
  });
});
