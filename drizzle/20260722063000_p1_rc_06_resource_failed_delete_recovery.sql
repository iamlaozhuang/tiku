CREATE TYPE "public"."resource_cleanup_job_status" AS ENUM('pending', 'processing', 'failed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "resource_cleanup_job" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resource_cleanup_job_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"source_resource_public_id" text NOT NULL,
	"profession" "profession" NOT NULL,
	"object_storage_path" text NOT NULL,
	"original_file_name" text NOT NULL,
	"file_size_byte" integer NOT NULL,
	"content_hash" text NOT NULL,
	"cleanup_status" "resource_cleanup_job_status" DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_failure_message_digest" text,
	"claimed_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_resource_cleanup_job_attempt_count_nonnegative" CHECK ("resource_cleanup_job"."attempt_count" >= 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_cleanup_job_public_id" ON "resource_cleanup_job" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_cleanup_job_source_resource_public_id" ON "resource_cleanup_job" USING btree ("source_resource_public_id");--> statement-breakpoint
CREATE INDEX "idx_resource_cleanup_job_object_storage_path" ON "resource_cleanup_job" USING btree ("object_storage_path");--> statement-breakpoint
CREATE INDEX "idx_resource_cleanup_job_status_updated_at" ON "resource_cleanup_job" USING btree ("cleanup_status","updated_at");