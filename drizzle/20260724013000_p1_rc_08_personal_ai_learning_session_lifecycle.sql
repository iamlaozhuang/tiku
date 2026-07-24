ALTER TABLE "personal_ai_learning_session" ADD COLUMN "lifecycle_schema_version" integer;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD COLUMN "authorization_source" text;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD COLUMN "authorization_public_id" text;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD COLUMN "session_status" text;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD COLUMN "session_revision" integer;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD COLUMN "completion_summary_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD COLUMN "completion_summary_digest" text;--> statement-breakpoint
CREATE INDEX "idx_personal_ai_learning_session_actor_auth_created_at" ON "personal_ai_learning_session" USING btree ("actor_public_id","authorization_source","authorization_public_id","created_at","id");--> statement-breakpoint
ALTER TABLE "personal_ai_learning_session" ADD CONSTRAINT "chk_personal_ai_learning_session_lifecycle" CHECK ((
        (
          "personal_ai_learning_session"."lifecycle_schema_version" is null
          and "personal_ai_learning_session"."authorization_source" is null
          and "personal_ai_learning_session"."authorization_public_id" is null
          and "personal_ai_learning_session"."session_status" is null
          and "personal_ai_learning_session"."session_revision" is null
          and "personal_ai_learning_session"."completed_at" is null
          and "personal_ai_learning_session"."completion_summary_snapshot" is null
          and "personal_ai_learning_session"."completion_summary_digest" is null
        )
        or
        (
          "personal_ai_learning_session"."lifecycle_schema_version" is not null
          and "personal_ai_learning_session"."authorization_source" is not null
          and "personal_ai_learning_session"."session_status" is not null
          and "personal_ai_learning_session"."session_revision" is not null
          and
          "personal_ai_learning_session"."lifecycle_schema_version" = 1
          and (
            ("personal_ai_learning_session"."owner_type" = 'personal' and "personal_ai_learning_session"."authorization_source" = 'personal_auth')
            or
            ("personal_ai_learning_session"."owner_type" = 'organization' and "personal_ai_learning_session"."authorization_source" = 'org_auth')
          )
          and "personal_ai_learning_session"."authorization_public_id" is not null
          and length("personal_ai_learning_session"."authorization_public_id") between 1 and 255
          and "personal_ai_learning_session"."session_status" in ('in_progress', 'completed')
          and "personal_ai_learning_session"."session_revision" between 1 and 2147483647
          and (
            (
              "personal_ai_learning_session"."session_status" = 'in_progress'
              and "personal_ai_learning_session"."completed_at" is null
              and "personal_ai_learning_session"."completion_summary_snapshot" is null
              and "personal_ai_learning_session"."completion_summary_digest" is null
            )
            or
            (
              "personal_ai_learning_session"."session_status" = 'completed'
              and "personal_ai_learning_session"."completed_at" is not null
              and "personal_ai_learning_session"."completed_at" >= "personal_ai_learning_session"."created_at"
              and "personal_ai_learning_session"."completion_summary_snapshot" is not null
              and jsonb_typeof("personal_ai_learning_session"."completion_summary_snapshot") = 'object'
              and "personal_ai_learning_session"."completion_summary_digest" is not null
              and "personal_ai_learning_session"."completion_summary_digest" ~ '^[0-9a-f]{64}$'
            )
          )
        )
      ));
