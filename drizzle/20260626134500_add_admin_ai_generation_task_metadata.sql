ALTER TABLE "ai_generation_task" ALTER COLUMN "ai_func_type" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_generation_task" ALTER COLUMN "question_public_id" DROP NOT NULL;--> statement-breakpoint
CREATE TABLE "admin_ai_generation_task_metadata" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_ai_generation_task_metadata_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"ai_generation_task_id" bigint NOT NULL,
	"task_public_id" text NOT NULL,
	"request_public_id" text NOT NULL,
	"workspace" text NOT NULL,
	"generation_kind" text NOT NULL,
	"authorization_source" text NOT NULL,
	"result_kind" text NOT NULL,
	"content_visibility" text NOT NULL,
	"runtime_status" text NOT NULL,
	"runtime_bridge_status" text NOT NULL,
	"provider_call_executed" boolean DEFAULT false NOT NULL,
	"env_secret_accessed" boolean DEFAULT false NOT NULL,
	"provider_configuration_read" boolean DEFAULT false NOT NULL,
	"cost_calibration_executed" boolean DEFAULT false NOT NULL,
	"question_write_status" text NOT NULL,
	"paper_write_status" text NOT NULL,
	"source_question_public_id" text,
	"source_paper_public_id" text,
	"redaction_status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_ai_generation_task_metadata" ADD CONSTRAINT "fk_admin_ai_generation_task_metadata_task" FOREIGN KEY ("ai_generation_task_id") REFERENCES "public"."ai_generation_task"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_ai_generation_task_metadata_public_id" ON "admin_ai_generation_task_metadata" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_ai_generation_task_metadata_ai_generation_task_id" ON "admin_ai_generation_task_metadata" USING btree ("ai_generation_task_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_ai_generation_task_metadata_task_public_id" ON "admin_ai_generation_task_metadata" USING btree ("task_public_id");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_task_metadata_workspace_generation_kind" ON "admin_ai_generation_task_metadata" USING btree ("workspace","generation_kind");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_task_metadata_runtime_bridge_status" ON "admin_ai_generation_task_metadata" USING btree ("runtime_bridge_status");--> statement-breakpoint
CREATE INDEX "idx_admin_ai_generation_task_metadata_request_public_id" ON "admin_ai_generation_task_metadata" USING btree ("request_public_id");
