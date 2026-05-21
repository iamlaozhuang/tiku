CREATE TABLE "audit_log" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"actor_public_id" text NOT NULL,
	"actor_role" text NOT NULL,
	"action_type" text NOT NULL,
	"target_resource_type" text NOT NULL,
	"target_public_id" text,
	"result_status" text NOT NULL,
	"metadata_summary" text,
	"request_ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "udx_audit_log_public_id" ON "audit_log" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_actor_public_id" ON "audit_log" USING btree ("actor_public_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_action_type_result_status" ON "audit_log" USING btree ("action_type","result_status");--> statement-breakpoint
CREATE INDEX "idx_audit_log_target_resource_type_target_public_id" ON "audit_log" USING btree ("target_resource_type","target_public_id");--> statement-breakpoint
CREATE INDEX "idx_audit_log_created_at" ON "audit_log" USING btree ("created_at");