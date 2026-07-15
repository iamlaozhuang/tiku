CREATE TABLE "paper_command" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paper_command_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"actor_admin_id" bigint NOT NULL,
	"paper_id" bigint,
	"command_kind" text NOT NULL,
	"request_hash" text NOT NULL,
	"result_public_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "paper" ADD COLUMN "revision" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "paper_scoring_point" ADD COLUMN "public_id" text DEFAULT 'psp_' || replace(gen_random_uuid()::text, '-', '') NOT NULL;--> statement-breakpoint
ALTER TABLE "question_group" ADD COLUMN "public_id" text DEFAULT 'qgroup_' || replace(gen_random_uuid()::text, '-', '') NOT NULL;--> statement-breakpoint
ALTER TABLE "paper_command" ADD CONSTRAINT "paper_command_actor_admin_id_admin_id_fk" FOREIGN KEY ("actor_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_command" ADD CONSTRAINT "paper_command_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_command_public_id" ON "paper_command" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_paper_command_actor_admin_id_command_kind" ON "paper_command" USING btree ("actor_admin_id","command_kind");--> statement-breakpoint
CREATE INDEX "idx_paper_command_paper_id" ON "paper_command" USING btree ("paper_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_scoring_point_public_id" ON "paper_scoring_point" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_question_group_public_id" ON "question_group" USING btree ("public_id");