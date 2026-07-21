CREATE TYPE "public"."resource_upload_operation_status" AS ENUM('pending', 'file_stored', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "resource_upload_operation" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resource_upload_operation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"actor_public_id" text NOT NULL,
	"idempotency_key_hash" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"resource_public_id" text NOT NULL,
	"object_storage_path" text NOT NULL,
	"file_hash" text NOT NULL,
	"file_size_byte" integer NOT NULL,
	"operation_status" "resource_upload_operation_status" DEFAULT 'pending' NOT NULL,
	"resource_id" bigint,
	"last_failure_message_digest" text,
	"file_stored_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resource_upload_operation" ADD CONSTRAINT "resource_upload_operation_resource_id_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_upload_operation_public_id" ON "resource_upload_operation" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_upload_operation_idempotency_key_hash" ON "resource_upload_operation" USING btree ("idempotency_key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_upload_operation_resource_public_id" ON "resource_upload_operation" USING btree ("resource_public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_upload_operation_resource_id" ON "resource_upload_operation" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "idx_resource_upload_operation_status_updated_at" ON "resource_upload_operation" USING btree ("operation_status","updated_at");
