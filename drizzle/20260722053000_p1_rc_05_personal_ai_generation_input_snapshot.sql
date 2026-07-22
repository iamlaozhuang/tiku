ALTER TABLE "ai_generation_task" ADD COLUMN "generation_snapshot_version" integer;--> statement-breakpoint
ALTER TABLE "ai_generation_task" ADD COLUMN "generation_input_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "ai_generation_task" ADD COLUMN "generation_constraint_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "ai_generation_task" ADD COLUMN "generation_snapshot_digest" text;--> statement-breakpoint
ALTER TABLE "ai_generation_task" ADD CONSTRAINT "chk_ai_generation_task_snapshot_completeness" CHECK ((
        ("ai_generation_task"."generation_snapshot_version" is null and "ai_generation_task"."generation_input_snapshot" is null and "ai_generation_task"."generation_constraint_snapshot" is null and "ai_generation_task"."generation_snapshot_digest" is null)
        or
        ("ai_generation_task"."generation_snapshot_version" = 1 and "ai_generation_task"."generation_input_snapshot" is not null and "ai_generation_task"."generation_constraint_snapshot" is not null and "ai_generation_task"."generation_snapshot_digest" is not null)
      ));--> statement-breakpoint
ALTER TABLE "ai_generation_task" ADD CONSTRAINT "chk_ai_generation_task_snapshot_digest" CHECK ("ai_generation_task"."generation_snapshot_digest" is null or "ai_generation_task"."generation_snapshot_digest" ~ '^sha256:[0-9a-f]{64}$');