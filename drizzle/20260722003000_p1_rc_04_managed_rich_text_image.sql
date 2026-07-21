CREATE TYPE "public"."content_image_upload_operation_status" AS ENUM('pending', 'file_stored', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "content_image" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"profession" "profession" NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size_byte" bigint NOT NULL,
	"file_hash" text NOT NULL,
	"created_by_admin_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_image_upload_operation" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_image_upload_operation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"actor_admin_id" bigint NOT NULL,
	"content_image_id" bigint,
	"content_image_public_id" text NOT NULL,
	"idempotency_key_hash" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"profession" "profession" NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size_byte" bigint NOT NULL,
	"file_hash" text NOT NULL,
	"operation_status" "content_image_upload_operation_status" DEFAULT 'pending' NOT NULL,
	"last_failure_message_digest" text,
	"file_stored_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_image" ADD CONSTRAINT "content_image_created_by_admin_id_admin_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_image_upload_operation" ADD CONSTRAINT "content_image_upload_operation_actor_admin_id_admin_id_fk" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_image_upload_operation" ADD CONSTRAINT "content_image_upload_operation_content_image_id_content_image_id_fk" FOREIGN KEY ("content_image_id") REFERENCES "public"."content_image"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_content_image_public_id" ON "content_image" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_content_image_file_hash" ON "content_image" USING btree ("file_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_content_image_upload_operation_public_id" ON "content_image_upload_operation" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_content_image_upload_operation_idempotency_key_hash" ON "content_image_upload_operation" USING btree ("idempotency_key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_content_image_upload_operation_content_image_public_id" ON "content_image_upload_operation" USING btree ("content_image_public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_content_image_upload_operation_content_image_id" ON "content_image_upload_operation" USING btree ("content_image_id");--> statement-breakpoint
CREATE INDEX "idx_content_image_upload_operation_status_updated_at" ON "content_image_upload_operation" USING btree ("operation_status","updated_at");