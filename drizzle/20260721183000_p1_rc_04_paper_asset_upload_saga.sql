CREATE TYPE "public"."paper_asset_upload_operation_status" AS ENUM('pending', 'file_stored', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "paper_asset_upload_operation" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paper_asset_upload_operation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"actor_admin_id" bigint NOT NULL,
	"paper_id" bigint NOT NULL,
	"paper_asset_id" bigint,
	"paper_asset_public_id" text NOT NULL,
	"idempotency_key_hash" text NOT NULL,
	"request_fingerprint" text NOT NULL,
	"paper_attachment_usage" "paper_attachment_usage" NOT NULL,
	"file_name" text NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size_byte" bigint NOT NULL,
	"file_hash" text NOT NULL,
	"operation_status" "paper_asset_upload_operation_status" DEFAULT 'pending' NOT NULL,
	"last_failure_message_digest" text,
	"file_stored_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "paper_asset_upload_operation" ADD CONSTRAINT "paper_asset_upload_operation_actor_admin_id_admin_id_fk" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_asset_upload_operation" ADD CONSTRAINT "paper_asset_upload_operation_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_asset_upload_operation" ADD CONSTRAINT "paper_asset_upload_operation_paper_asset_id_paper_asset_id_fk" FOREIGN KEY ("paper_asset_id") REFERENCES "public"."paper_asset"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_asset_upload_operation_public_id" ON "paper_asset_upload_operation" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_asset_upload_operation_idempotency_key_hash" ON "paper_asset_upload_operation" USING btree ("idempotency_key_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_asset_upload_operation_paper_asset_public_id" ON "paper_asset_upload_operation" USING btree ("paper_asset_public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_asset_upload_operation_paper_asset_id" ON "paper_asset_upload_operation" USING btree ("paper_asset_id");--> statement-breakpoint
CREATE INDEX "idx_paper_asset_upload_operation_status_updated_at" ON "paper_asset_upload_operation" USING btree ("operation_status","updated_at");