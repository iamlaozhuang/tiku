ALTER TABLE "ai_call_log" ADD COLUMN "observation_schema_version" integer;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD COLUMN "token_count_source" text;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD COLUMN "token_estimation_method" text;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD COLUMN "latency_source" text;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD CONSTRAINT "chk_ai_call_log_observation_v1" CHECK ((
        "ai_call_log"."observation_schema_version" is null
        and "ai_call_log"."token_count_source" is null
        and "ai_call_log"."token_estimation_method" is null
        and "ai_call_log"."latency_source" is null
      ) or (
        "ai_call_log"."observation_schema_version" is not null
        and "ai_call_log"."observation_schema_version" = 1
        and "ai_call_log"."token_count_source" is not null
        and "ai_call_log"."latency_source" is not null
        and (
          (
            "ai_call_log"."token_count_source" = 'unavailable'
            and "ai_call_log"."token_estimation_method" is null
            and "ai_call_log"."prompt_token_count" is null
            and "ai_call_log"."completion_token_count" is null
            and "ai_call_log"."total_token_count" is null
            and "ai_call_log"."estimated_cost_cny" is null
          ) or (
            "ai_call_log"."token_count_source" = 'provider_reported'
            and "ai_call_log"."token_estimation_method" is null
            and "ai_call_log"."prompt_token_count" is not null
            and "ai_call_log"."completion_token_count" is not null
            and "ai_call_log"."total_token_count" is not null
            and "ai_call_log"."prompt_token_count" between 0 and 2147483647
            and "ai_call_log"."completion_token_count" between 0 and 2147483647
            and "ai_call_log"."total_token_count" between 0 and 2147483647
            and "ai_call_log"."total_token_count" = "ai_call_log"."prompt_token_count" + "ai_call_log"."completion_token_count"
          ) or (
            "ai_call_log"."token_count_source" = 'estimated'
            and "ai_call_log"."token_estimation_method" is not null
            and "ai_call_log"."token_estimation_method" = 'canonical_json_unicode_code_point_ceiling_v1'
            and "ai_call_log"."prompt_token_count" is not null
            and "ai_call_log"."completion_token_count" is not null
            and "ai_call_log"."total_token_count" is not null
            and "ai_call_log"."prompt_token_count" between 0 and 2147483647
            and "ai_call_log"."completion_token_count" between 0 and 2147483647
            and "ai_call_log"."total_token_count" between 0 and 2147483647
            and "ai_call_log"."total_token_count" = "ai_call_log"."prompt_token_count" + "ai_call_log"."completion_token_count"
          )
        )
        and (
          ("ai_call_log"."latency_source" = 'unavailable' and "ai_call_log"."latency_ms" is null)
          or (
            "ai_call_log"."latency_source" in ('provider_reported', 'client_observed')
            and "ai_call_log"."latency_ms" is not null
            and "ai_call_log"."latency_ms" between 0 and 2147483647
          )
        )
      ));
