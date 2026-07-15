CREATE EXTENSION IF NOT EXISTS "vector";--> statement-breakpoint
CREATE TYPE "public"."kn_recommendation_review_status" AS ENUM('pending', 'confirmed', 'ignored');--> statement-breakpoint
CREATE TYPE "public"."kn_recommendation_task_status" AS ENUM('pending', 'running', 'succeeded', 'failed', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."resource_index_generation_status" AS ENUM('pending', 'indexing', 'ready', 'failed', 'superseded');--> statement-breakpoint
CREATE TABLE "kn_recommendation_candidate" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kn_recommendation_candidate_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"kn_recommendation_task_id" bigint NOT NULL,
	"knowledge_node_id" bigint NOT NULL,
	"rank" integer NOT NULL,
	"confidence_basis_point" integer NOT NULL,
	"reason_summary" text NOT NULL,
	"citation_snapshot" jsonb NOT NULL,
	"review_status" "kn_recommendation_review_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by_user_public_id" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kn_recommendation_task" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kn_recommendation_task_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"request_public_id" text NOT NULL,
	"question_id" bigint NOT NULL,
	"question_revision_at" timestamp with time zone NOT NULL,
	"task_status" "kn_recommendation_task_status" DEFAULT 'pending' NOT NULL,
	"evidence_status" "evidence_status",
	"model_config_id" bigint,
	"prompt_template_id" bigint,
	"requested_by_user_public_id" text,
	"failure_code" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_chunk" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resource_chunk_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"resource_index_generation_id" bigint NOT NULL,
	"resource_id" bigint NOT NULL,
	"chunk_index" integer NOT NULL,
	"heading_path" jsonb NOT NULL,
	"content" text NOT NULL,
	"content_hash" text NOT NULL,
	"keyword_token_list" jsonb NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_index_generation" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resource_index_generation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"request_public_id" text NOT NULL,
	"resource_id" bigint NOT NULL,
	"source_content_hash" text NOT NULL,
	"generation_status" "resource_index_generation_status" DEFAULT 'pending' NOT NULL,
	"embedding_model_config_id" bigint,
	"embedding_dimension" integer,
	"chunk_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"failure_message_digest" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kn_recommendation_candidate" ADD CONSTRAINT "kn_recommendation_candidate_kn_recommendation_task_id_kn_recommendation_task_id_fk" FOREIGN KEY ("kn_recommendation_task_id") REFERENCES "public"."kn_recommendation_task"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kn_recommendation_candidate" ADD CONSTRAINT "kn_recommendation_candidate_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kn_recommendation_task" ADD CONSTRAINT "kn_recommendation_task_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kn_recommendation_task" ADD CONSTRAINT "kn_recommendation_task_model_config_id_model_config_id_fk" FOREIGN KEY ("model_config_id") REFERENCES "public"."model_config"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kn_recommendation_task" ADD CONSTRAINT "kn_recommendation_task_prompt_template_id_prompt_template_id_fk" FOREIGN KEY ("prompt_template_id") REFERENCES "public"."prompt_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_chunk" ADD CONSTRAINT "resource_chunk_resource_id_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_chunk" ADD CONSTRAINT "fk_resource_chunk_generation_resource" FOREIGN KEY ("resource_index_generation_id","resource_id") REFERENCES "public"."resource_index_generation"("id","resource_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_index_generation" ADD CONSTRAINT "resource_index_generation_resource_id_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_index_generation" ADD CONSTRAINT "resource_index_generation_embedding_model_config_id_model_config_id_fk" FOREIGN KEY ("embedding_model_config_id") REFERENCES "public"."model_config"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_kn_recommendation_candidate_public_id" ON "kn_recommendation_candidate" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_kn_recommendation_candidate_task_node" ON "kn_recommendation_candidate" USING btree ("kn_recommendation_task_id","knowledge_node_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_kn_recommendation_candidate_task_rank" ON "kn_recommendation_candidate" USING btree ("kn_recommendation_task_id","rank");--> statement-breakpoint
CREATE INDEX "idx_kn_recommendation_candidate_review_status" ON "kn_recommendation_candidate" USING btree ("review_status");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_kn_recommendation_task_public_id" ON "kn_recommendation_task" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_kn_recommendation_task_request_public_id" ON "kn_recommendation_task" USING btree ("request_public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_kn_recommendation_task_question_revision" ON "kn_recommendation_task" USING btree ("question_id","question_revision_at");--> statement-breakpoint
CREATE INDEX "idx_kn_recommendation_task_status_created_at" ON "kn_recommendation_task" USING btree ("task_status","created_at");--> statement-breakpoint
CREATE INDEX "idx_kn_recommendation_task_model_config_id" ON "kn_recommendation_task" USING btree ("model_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_chunk_public_id" ON "resource_chunk" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_chunk_generation_chunk_index" ON "resource_chunk" USING btree ("resource_index_generation_id","chunk_index");--> statement-breakpoint
CREATE INDEX "idx_resource_chunk_resource_id" ON "resource_chunk" USING btree ("resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_index_generation_public_id" ON "resource_index_generation" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_index_generation_request_public_id" ON "resource_index_generation" USING btree ("request_public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_index_generation_id_resource_id" ON "resource_index_generation" USING btree ("id","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_index_generation_active_resource" ON "resource_index_generation" USING btree ("resource_id") WHERE "resource_index_generation"."is_active" = true;--> statement-breakpoint
CREATE INDEX "idx_resource_index_generation_resource_status" ON "resource_index_generation" USING btree ("resource_id","generation_status");--> statement-breakpoint
CREATE INDEX "idx_resource_index_generation_model_config_id" ON "resource_index_generation" USING btree ("embedding_model_config_id");--> statement-breakpoint
ALTER TABLE "knowledge_node" ADD CONSTRAINT "fk_knowledge_node_knowledge_base_scope" FOREIGN KEY ("knowledge_base_id","profession") REFERENCES "public"."knowledge_base"("id","profession") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_node" ADD CONSTRAINT "fk_knowledge_node_parent_scope" FOREIGN KEY ("parent_knowledge_node_id","knowledge_base_id","profession") REFERENCES "public"."knowledge_node"("id","knowledge_base_id","profession") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "fk_resource_knowledge_base_scope" FOREIGN KEY ("knowledge_base_id","profession") REFERENCES "public"."knowledge_base"("id","profession") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_knowledge_base_id_profession" ON "knowledge_base" USING btree ("id","profession");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_knowledge_node_id_knowledge_base_id_profession" ON "knowledge_node" USING btree ("id","knowledge_base_id","profession");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_id_knowledge_base_id_profession" ON "resource" USING btree ("id","knowledge_base_id","profession");
