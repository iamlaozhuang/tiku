CREATE TYPE "public"."admin_role" AS ENUM('super_admin', 'ops_admin', 'content_admin');--> statement-breakpoint
CREATE TYPE "public"."auth_scope_type" AS ENUM('current_and_descendants', 'specified_nodes');--> statement-breakpoint
CREATE TYPE "public"."auth_status" AS ENUM('active', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."org_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."org_tier" AS ENUM('province', 'city', 'district', 'station');--> statement-breakpoint
CREATE TYPE "public"."profession" AS ENUM('monopoly', 'marketing', 'logistics');--> statement-breakpoint
CREATE TYPE "public"."redeem_code_status" AS ENUM('unused', 'used', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('personal', 'employee');--> statement-breakpoint
CREATE TYPE "public"."ai_call_status" AS ENUM('success', 'failed');--> statement-breakpoint
CREATE TYPE "public"."ai_func_type" AS ENUM('scoring', 'explanation', 'hint', 'kn_recommendation', 'learning_suggestion');--> statement-breakpoint
CREATE TYPE "public"."kn_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."resource_status" AS ENUM('uploaded', 'converting', 'conversion_failed', 'draft', 'published', 'indexing', 'index_failed', 'rag_ready', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('textbook', 'courseware', 'knowledge_doc', 'lecture_note', 'other');--> statement-breakpoint
CREATE TYPE "public"."material_status" AS ENUM('available', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."multi_choice_rule" AS ENUM('all_correct_only', 'partial_credit');--> statement-breakpoint
CREATE TYPE "public"."paper_attachment_usage" AS ENUM('paper_source', 'answer_analysis', 'answer_sheet', 'other');--> statement-breakpoint
CREATE TYPE "public"."paper_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."paper_type" AS ENUM('past_paper', 'mock_paper');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('available', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('single_choice', 'multi_choice', 'true_false', 'fill_blank', 'short_answer');--> statement-breakpoint
CREATE TYPE "public"."scoring_method" AS ENUM('auto_match', 'ai_scoring');--> statement-breakpoint
CREATE TYPE "public"."subject" AS ENUM('theory', 'skill');--> statement-breakpoint
CREATE TYPE "public"."answer_record_status" AS ENUM('draft', 'saved', 'submitted', 'scored', 'scoring_failed');--> statement-breakpoint
CREATE TYPE "public"."exam_mode" AS ENUM('practice', 'mock_exam');--> statement-breakpoint
CREATE TYPE "public"."exam_status" AS ENUM('in_progress', 'scoring', 'scoring_partial_failed', 'completed', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."mistake_book_source" AS ENUM('wrong_answer', 'favorite');--> statement-breakpoint
CREATE TYPE "public"."mistake_book_status" AS ENUM('unmastered', 'mastered', 'removed');--> statement-breakpoint
CREATE TYPE "public"."practice_status" AS ENUM('in_progress', 'completed', 'expired', 'terminated');--> statement-breakpoint
CREATE TABLE "admin" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"auth_user_id" text,
	"phone" text NOT NULL,
	"name" text NOT NULL,
	"admin_role" "admin_role" NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" timestamp with time zone DEFAULT now() NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "employee_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"organization_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_auth" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "org_auth_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"name" text NOT NULL,
	"purchaser_organization_id" bigint NOT NULL,
	"auth_scope_type" "auth_scope_type" NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"account_quota" integer NOT NULL,
	"used_quota" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "auth_status" DEFAULT 'active' NOT NULL,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_auth_organization" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "org_auth_organization_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"org_auth_id" bigint NOT NULL,
	"organization_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "organization_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"name" text NOT NULL,
	"org_tier" "org_tier" NOT NULL,
	"parent_organization_id" bigint,
	"status" "org_status" DEFAULT 'active' NOT NULL,
	"contact_name" text,
	"contact_phone" text,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_auth" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "personal_auth_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"redeem_code_id" bigint NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "auth_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redeem_code" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "redeem_code_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"code_hash" text NOT NULL,
	"code_display" text NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"duration_day" integer NOT NULL,
	"redeem_deadline_at" timestamp with time zone NOT NULL,
	"status" "redeem_code_status" DEFAULT 'unused' NOT NULL,
	"used_by_user_id" bigint,
	"used_at" timestamp with time zone,
	"generation_group_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "student_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"auth_user_id" text,
	"phone" text NOT NULL,
	"name" text NOT NULL,
	"user_type" "user_type" NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"login_failed_count" integer DEFAULT 0 NOT NULL,
	"locked_until_at" timestamp with time zone,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_call_log" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ai_call_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_public_id" text,
	"answer_record_public_id" text,
	"mock_exam_public_id" text,
	"question_public_id" text,
	"ai_func_type" "ai_func_type" NOT NULL,
	"call_status" "ai_call_status" NOT NULL,
	"model_config_id" bigint NOT NULL,
	"prompt_template_id" bigint NOT NULL,
	"model_config_snapshot" jsonb NOT NULL,
	"prompt_template_key" text NOT NULL,
	"prompt_template_version" integer NOT NULL,
	"request_redacted_snapshot" jsonb NOT NULL,
	"response_redacted_snapshot" jsonb,
	"error_redacted_snapshot" jsonb,
	"citation_redacted_snapshot" jsonb,
	"prompt_token_count" integer,
	"completion_token_count" integer,
	"total_token_count" integer,
	"latency_ms" integer,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_base" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "knowledge_base_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"profession" "profession" NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_node" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "knowledge_node_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"knowledge_base_id" bigint NOT NULL,
	"parent_knowledge_node_id" bigint,
	"profession" "profession" NOT NULL,
	"level_list" jsonb NOT NULL,
	"name" text NOT NULL,
	"path_name" text NOT NULL,
	"depth" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"kn_status" "kn_status" DEFAULT 'active' NOT NULL,
	"is_recommendable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"disabled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "knowledge_node_resource" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "knowledge_node_resource_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"knowledge_node_id" bigint NOT NULL,
	"resource_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_config" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "model_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"model_provider_id" bigint NOT NULL,
	"ai_func_type" "ai_func_type" NOT NULL,
	"model_name" text NOT NULL,
	"display_name" text NOT NULL,
	"config_version" integer NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"timeout_second" integer NOT NULL,
	"max_retry_count" integer DEFAULT 0 NOT NULL,
	"fallback_model_config_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "model_provider" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "model_provider_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"provider_key" text NOT NULL,
	"display_name" text NOT NULL,
	"api_key_secret_ref" text,
	"api_key_last_four" text,
	"base_url" text,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_template" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prompt_template_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"prompt_template_key" text NOT NULL,
	"ai_func_type" "ai_func_type" NOT NULL,
	"version" integer NOT NULL,
	"template_content" text NOT NULL,
	"template_hash" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "resource" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "resource_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"knowledge_base_id" bigint NOT NULL,
	"resource_type" "resource_type" NOT NULL,
	"resource_status" "resource_status" DEFAULT 'uploaded' NOT NULL,
	"title" text NOT NULL,
	"original_file_name" text,
	"object_storage_path" text,
	"content_hash" text,
	"file_size_byte" integer,
	"profession" "profession" NOT NULL,
	"level" integer,
	"markdown_content" text,
	"markdown_content_hash" text,
	"conversion_error_message" text,
	"indexing_error_message" text,
	"is_vector_stale" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "material_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"title" text NOT NULL,
	"content_rich_text" text NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"status" "material_status" DEFAULT 'available' NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp with time zone,
	"created_by_admin_id" bigint NOT NULL,
	"updated_by_admin_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paper_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"name" text NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"paper_status" "paper_status" DEFAULT 'draft' NOT NULL,
	"paper_type" "paper_type",
	"year" integer,
	"source" text,
	"duration_minute" integer,
	"total_score" numeric(8, 1),
	"published_at" timestamp with time zone,
	"archived_at" timestamp with time zone,
	"created_by_admin_id" bigint NOT NULL,
	"updated_by_admin_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_asset" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paper_asset_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"paper_id" bigint NOT NULL,
	"paper_attachment_usage" "paper_attachment_usage" NOT NULL,
	"file_name" text NOT NULL,
	"object_key" text NOT NULL,
	"content_type" text NOT NULL,
	"file_size_byte" bigint NOT NULL,
	"file_hash" text NOT NULL,
	"created_by_admin_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_question" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paper_question_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"paper_id" bigint NOT NULL,
	"paper_section_id" bigint NOT NULL,
	"question_group_id" bigint,
	"question_id" bigint NOT NULL,
	"question_snapshot" jsonb NOT NULL,
	"material_snapshot" jsonb,
	"score" numeric(8, 1),
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_scoring_point" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paper_scoring_point_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"paper_question_id" bigint NOT NULL,
	"source_scoring_point_id" bigint,
	"description" text NOT NULL,
	"score" numeric(8, 1) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paper_section" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "paper_section_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"paper_id" bigint NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer NOT NULL,
	"total_score" numeric(8, 1) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"stem_rich_text" text NOT NULL,
	"analysis_rich_text" text NOT NULL,
	"standard_answer_rich_text" text NOT NULL,
	"status" "question_status" DEFAULT 'available' NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"locked_at" timestamp with time zone,
	"multi_choice_rule" "multi_choice_rule" DEFAULT 'all_correct_only' NOT NULL,
	"scoring_method" "scoring_method" DEFAULT 'auto_match' NOT NULL,
	"material_id" bigint,
	"created_by_admin_id" bigint NOT NULL,
	"updated_by_admin_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_group" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_group_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"paper_id" bigint NOT NULL,
	"paper_section_id" bigint NOT NULL,
	"material_id" bigint NOT NULL,
	"material_snapshot" jsonb NOT NULL,
	"title" text NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_option" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_option_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"label" text NOT NULL,
	"content_rich_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scoring_point" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scoring_point_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"description" text NOT NULL,
	"score" numeric(8, 1) NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "answer_record" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "answer_record_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"exam_mode" "exam_mode" NOT NULL,
	"practice_id" bigint,
	"mock_exam_id" bigint,
	"paper_id" bigint NOT NULL,
	"paper_question_id" bigint NOT NULL,
	"paper_question_public_id" text NOT NULL,
	"question_public_id" text NOT NULL,
	"question_snapshot" jsonb NOT NULL,
	"answer_snapshot" jsonb NOT NULL,
	"answer_record_status" "answer_record_status" DEFAULT 'draft' NOT NULL,
	"is_correct" boolean,
	"score" numeric(8, 1),
	"max_score" numeric(8, 1) NOT NULL,
	"answered_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_report" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exam_report_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"mock_exam_id" bigint NOT NULL,
	"paper_id" bigint NOT NULL,
	"paper_public_id" text NOT NULL,
	"report_snapshot" jsonb NOT NULL,
	"exam_status" "exam_status" NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"objective_score" numeric(8, 1),
	"subjective_score" numeric(8, 1),
	"total_score" numeric(8, 1),
	"duration_second" integer NOT NULL,
	"learning_suggestion_snapshot" jsonb,
	"generated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mistake_book" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mistake_book_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"question_public_id" text NOT NULL,
	"paper_question_public_id" text NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"question_snapshot" jsonb NOT NULL,
	"latest_answer_snapshot" jsonb NOT NULL,
	"mistake_book_source" "mistake_book_source" DEFAULT 'wrong_answer' NOT NULL,
	"mistake_book_status" "mistake_book_status" DEFAULT 'unmastered' NOT NULL,
	"wrong_count" integer DEFAULT 1 NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_removed" boolean DEFAULT false NOT NULL,
	"mastered_at" timestamp with time zone,
	"latest_wrong_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_exam" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "mock_exam_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"paper_id" bigint NOT NULL,
	"paper_public_id" text NOT NULL,
	"paper_snapshot" jsonb NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"exam_status" "exam_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"server_deadline_at" timestamp with time zone,
	"duration_minute" integer,
	"terminated_at" timestamp with time zone,
	"termination_reason" text,
	"objective_score" numeric(8, 1),
	"subjective_score" numeric(8, 1),
	"total_score" numeric(8, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "practice_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"paper_id" bigint NOT NULL,
	"paper_public_id" text NOT NULL,
	"paper_snapshot" jsonb NOT NULL,
	"profession" "profession" NOT NULL,
	"level" integer NOT NULL,
	"subject" "subject" NOT NULL,
	"practice_status" "practice_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"last_answered_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"terminated_at" timestamp with time zone,
	"termination_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin" ADD CONSTRAINT "admin_auth_user_id_auth_user_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_account" ADD CONSTRAINT "auth_account_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_auth_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_auth" ADD CONSTRAINT "org_auth_purchaser_organization_id_organization_id_fk" FOREIGN KEY ("purchaser_organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_auth_organization" ADD CONSTRAINT "org_auth_organization_org_auth_id_org_auth_id_fk" FOREIGN KEY ("org_auth_id") REFERENCES "public"."org_auth"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_auth_organization" ADD CONSTRAINT "org_auth_organization_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_parent_organization_id_organization_id_fk" FOREIGN KEY ("parent_organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_auth" ADD CONSTRAINT "personal_auth_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_auth" ADD CONSTRAINT "personal_auth_redeem_code_id_redeem_code_id_fk" FOREIGN KEY ("redeem_code_id") REFERENCES "public"."redeem_code"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redeem_code" ADD CONSTRAINT "redeem_code_used_by_user_id_user_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_auth_user_id_auth_user_id_fk" FOREIGN KEY ("auth_user_id") REFERENCES "public"."auth_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD CONSTRAINT "ai_call_log_model_config_id_model_config_id_fk" FOREIGN KEY ("model_config_id") REFERENCES "public"."model_config"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_call_log" ADD CONSTRAINT "ai_call_log_prompt_template_id_prompt_template_id_fk" FOREIGN KEY ("prompt_template_id") REFERENCES "public"."prompt_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_node" ADD CONSTRAINT "knowledge_node_knowledge_base_id_knowledge_base_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_base"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_node" ADD CONSTRAINT "knowledge_node_parent_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("parent_knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_node_resource" ADD CONSTRAINT "knowledge_node_resource_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_node_resource" ADD CONSTRAINT "knowledge_node_resource_resource_id_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resource"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_config" ADD CONSTRAINT "model_config_model_provider_id_model_provider_id_fk" FOREIGN KEY ("model_provider_id") REFERENCES "public"."model_provider"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_config" ADD CONSTRAINT "model_config_fallback_model_config_id_model_config_id_fk" FOREIGN KEY ("fallback_model_config_id") REFERENCES "public"."model_config"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource" ADD CONSTRAINT "resource_knowledge_base_id_knowledge_base_id_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_base"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material" ADD CONSTRAINT "material_created_by_admin_id_admin_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "material" ADD CONSTRAINT "material_updated_by_admin_id_admin_id_fk" FOREIGN KEY ("updated_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper" ADD CONSTRAINT "paper_created_by_admin_id_admin_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper" ADD CONSTRAINT "paper_updated_by_admin_id_admin_id_fk" FOREIGN KEY ("updated_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_asset" ADD CONSTRAINT "paper_asset_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_asset" ADD CONSTRAINT "paper_asset_created_by_admin_id_admin_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_question" ADD CONSTRAINT "paper_question_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_question" ADD CONSTRAINT "paper_question_paper_section_id_paper_section_id_fk" FOREIGN KEY ("paper_section_id") REFERENCES "public"."paper_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_question" ADD CONSTRAINT "paper_question_question_group_id_question_group_id_fk" FOREIGN KEY ("question_group_id") REFERENCES "public"."question_group"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_question" ADD CONSTRAINT "paper_question_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_scoring_point" ADD CONSTRAINT "paper_scoring_point_paper_question_id_paper_question_id_fk" FOREIGN KEY ("paper_question_id") REFERENCES "public"."paper_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_scoring_point" ADD CONSTRAINT "paper_scoring_point_source_scoring_point_id_scoring_point_id_fk" FOREIGN KEY ("source_scoring_point_id") REFERENCES "public"."scoring_point"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paper_section" ADD CONSTRAINT "paper_section_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_created_by_admin_id_admin_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_updated_by_admin_id_admin_id_fk" FOREIGN KEY ("updated_by_admin_id") REFERENCES "public"."admin"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_group" ADD CONSTRAINT "question_group_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_group" ADD CONSTRAINT "question_group_paper_section_id_paper_section_id_fk" FOREIGN KEY ("paper_section_id") REFERENCES "public"."paper_section"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_group" ADD CONSTRAINT "question_group_material_id_material_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."material"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_option" ADD CONSTRAINT "question_option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scoring_point" ADD CONSTRAINT "scoring_point_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_record" ADD CONSTRAINT "answer_record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_record" ADD CONSTRAINT "answer_record_practice_id_practice_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practice"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_record" ADD CONSTRAINT "answer_record_mock_exam_id_mock_exam_id_fk" FOREIGN KEY ("mock_exam_id") REFERENCES "public"."mock_exam"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_record" ADD CONSTRAINT "answer_record_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer_record" ADD CONSTRAINT "answer_record_paper_question_id_paper_question_id_fk" FOREIGN KEY ("paper_question_id") REFERENCES "public"."paper_question"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_report" ADD CONSTRAINT "exam_report_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_report" ADD CONSTRAINT "exam_report_mock_exam_id_mock_exam_id_fk" FOREIGN KEY ("mock_exam_id") REFERENCES "public"."mock_exam"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_report" ADD CONSTRAINT "exam_report_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_book" ADD CONSTRAINT "mistake_book_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exam" ADD CONSTRAINT "mock_exam_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_exam" ADD CONSTRAINT "mock_exam_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice" ADD CONSTRAINT "practice_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "practice" ADD CONSTRAINT "practice_paper_id_paper_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."paper"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_public_id" ON "admin" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_auth_user_id" ON "admin" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_phone" ON "admin" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_admin_admin_role" ON "admin" USING btree ("admin_role");--> statement-breakpoint
CREATE INDEX "idx_admin_status" ON "admin" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_auth_account_provider_id_account_id" ON "auth_account" USING btree ("provider_id","account_id");--> statement-breakpoint
CREATE INDEX "idx_auth_account_user_id" ON "auth_account" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_auth_session_token" ON "auth_session" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_auth_session_user_id" ON "auth_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_session_expires_at" ON "auth_session" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_auth_user_email" ON "auth_user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_auth_user_created_at" ON "auth_user" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_auth_verification_identifier" ON "auth_verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_auth_verification_expires_at" ON "auth_verification" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_employee_public_id" ON "employee" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_employee_user_id" ON "employee" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_employee_organization_id" ON "employee" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_org_auth_public_id" ON "org_auth" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_org_auth_purchaser_organization_id" ON "org_auth" USING btree ("purchaser_organization_id");--> statement-breakpoint
CREATE INDEX "idx_org_auth_status" ON "org_auth" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_org_auth_profession_level" ON "org_auth" USING btree ("profession","level");--> statement-breakpoint
CREATE INDEX "idx_org_auth_expires_at" ON "org_auth" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_org_auth_organization_org_auth_id_organization_id" ON "org_auth_organization" USING btree ("org_auth_id","organization_id");--> statement-breakpoint
CREATE INDEX "idx_org_auth_organization_org_auth_id" ON "org_auth_organization" USING btree ("org_auth_id");--> statement-breakpoint
CREATE INDEX "idx_org_auth_organization_organization_id" ON "org_auth_organization" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_organization_public_id" ON "organization" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_organization_parent_organization_id" ON "organization" USING btree ("parent_organization_id");--> statement-breakpoint
CREATE INDEX "idx_organization_org_tier" ON "organization" USING btree ("org_tier");--> statement-breakpoint
CREATE INDEX "idx_organization_status" ON "organization" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_personal_auth_public_id" ON "personal_auth" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_personal_auth_redeem_code_id" ON "personal_auth" USING btree ("redeem_code_id");--> statement-breakpoint
CREATE INDEX "idx_personal_auth_user_id" ON "personal_auth" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_personal_auth_status" ON "personal_auth" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_personal_auth_profession_level" ON "personal_auth" USING btree ("profession","level");--> statement-breakpoint
CREATE INDEX "idx_personal_auth_expires_at" ON "personal_auth" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_redeem_code_public_id" ON "redeem_code" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_redeem_code_code_hash" ON "redeem_code" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "idx_redeem_code_status" ON "redeem_code" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_redeem_code_used_by_user_id" ON "redeem_code" USING btree ("used_by_user_id");--> statement-breakpoint
CREATE INDEX "idx_redeem_code_generation_group_id" ON "redeem_code" USING btree ("generation_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_student_user_id" ON "student" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_student_created_at" ON "student" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_user_public_id" ON "user" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_user_auth_user_id" ON "user" USING btree ("auth_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_user_phone" ON "user" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_user_status" ON "user" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_user_type" ON "user" USING btree ("user_type");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_ai_call_log_public_id" ON "ai_call_log" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_ai_call_log_user_public_id" ON "ai_call_log" USING btree ("user_public_id");--> statement-breakpoint
CREATE INDEX "idx_ai_call_log_answer_record_public_id" ON "ai_call_log" USING btree ("answer_record_public_id");--> statement-breakpoint
CREATE INDEX "idx_ai_call_log_model_config_id" ON "ai_call_log" USING btree ("model_config_id");--> statement-breakpoint
CREATE INDEX "idx_ai_call_log_ai_func_type_call_status" ON "ai_call_log" USING btree ("ai_func_type","call_status");--> statement-breakpoint
CREATE INDEX "idx_ai_call_log_started_at" ON "ai_call_log" USING btree ("started_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_knowledge_base_public_id" ON "knowledge_base" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_knowledge_base_profession" ON "knowledge_base" USING btree ("profession");--> statement-breakpoint
CREATE INDEX "idx_knowledge_base_is_enabled" ON "knowledge_base" USING btree ("is_enabled");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_knowledge_node_public_id" ON "knowledge_node" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_node_knowledge_base_id" ON "knowledge_node" USING btree ("knowledge_base_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_node_parent_knowledge_node_id" ON "knowledge_node" USING btree ("parent_knowledge_node_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_node_profession_kn_status" ON "knowledge_node" USING btree ("profession","kn_status");--> statement-breakpoint
CREATE INDEX "idx_knowledge_node_sort_order" ON "knowledge_node" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_knowledge_node_resource_knowledge_node_id_resource_id" ON "knowledge_node_resource" USING btree ("knowledge_node_id","resource_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_node_resource_knowledge_node_id" ON "knowledge_node_resource" USING btree ("knowledge_node_id");--> statement-breakpoint
CREATE INDEX "idx_knowledge_node_resource_resource_id" ON "knowledge_node_resource" USING btree ("resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_model_config_public_id" ON "model_config" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_model_config_model_provider_id" ON "model_config" USING btree ("model_provider_id");--> statement-breakpoint
CREATE INDEX "idx_model_config_ai_func_type_is_enabled" ON "model_config" USING btree ("ai_func_type","is_enabled");--> statement-breakpoint
CREATE INDEX "idx_model_config_fallback_model_config_id" ON "model_config" USING btree ("fallback_model_config_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_model_provider_public_id" ON "model_provider" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_model_provider_provider_key" ON "model_provider" USING btree ("provider_key");--> statement-breakpoint
CREATE INDEX "idx_model_provider_is_enabled" ON "model_provider" USING btree ("is_enabled");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_prompt_template_public_id" ON "prompt_template" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_prompt_template_key_version" ON "prompt_template" USING btree ("prompt_template_key","version");--> statement-breakpoint
CREATE INDEX "idx_prompt_template_ai_func_type_is_active" ON "prompt_template" USING btree ("ai_func_type","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_resource_public_id" ON "resource" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_resource_knowledge_base_id" ON "resource" USING btree ("knowledge_base_id");--> statement-breakpoint
CREATE INDEX "idx_resource_profession_level_resource_status" ON "resource" USING btree ("profession","level","resource_status");--> statement-breakpoint
CREATE INDEX "idx_resource_resource_status" ON "resource" USING btree ("resource_status");--> statement-breakpoint
CREATE INDEX "idx_resource_content_hash" ON "resource" USING btree ("content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_material_public_id" ON "material" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_material_profession_level_subject" ON "material" USING btree ("profession","level","subject");--> statement-breakpoint
CREATE INDEX "idx_material_status" ON "material" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_material_is_locked" ON "material" USING btree ("is_locked");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_public_id" ON "paper" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_paper_profession_level_subject" ON "paper" USING btree ("profession","level","subject");--> statement-breakpoint
CREATE INDEX "idx_paper_paper_status" ON "paper" USING btree ("paper_status");--> statement-breakpoint
CREATE INDEX "idx_paper_published_at" ON "paper" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_paper_updated_at" ON "paper" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_asset_public_id" ON "paper_asset" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_paper_asset_paper_id" ON "paper_asset" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "idx_paper_asset_paper_attachment_usage" ON "paper_asset" USING btree ("paper_attachment_usage");--> statement-breakpoint
CREATE INDEX "idx_paper_asset_file_hash" ON "paper_asset" USING btree ("file_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_paper_question_public_id" ON "paper_question" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_paper_question_paper_id" ON "paper_question" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "idx_paper_question_paper_section_id" ON "paper_question" USING btree ("paper_section_id");--> statement-breakpoint
CREATE INDEX "idx_paper_question_question_group_id" ON "paper_question" USING btree ("question_group_id");--> statement-breakpoint
CREATE INDEX "idx_paper_question_question_id" ON "paper_question" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_paper_question_sort_order" ON "paper_question" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_paper_scoring_point_paper_question_id" ON "paper_scoring_point" USING btree ("paper_question_id");--> statement-breakpoint
CREATE INDEX "idx_paper_scoring_point_source_scoring_point_id" ON "paper_scoring_point" USING btree ("source_scoring_point_id");--> statement-breakpoint
CREATE INDEX "idx_paper_scoring_point_sort_order" ON "paper_scoring_point" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_paper_section_paper_id" ON "paper_section" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "idx_paper_section_sort_order" ON "paper_section" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_question_public_id" ON "question" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_question_profession_level_subject" ON "question" USING btree ("profession","level","subject");--> statement-breakpoint
CREATE INDEX "idx_question_question_type" ON "question" USING btree ("question_type");--> statement-breakpoint
CREATE INDEX "idx_question_status" ON "question" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_question_material_id" ON "question" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "idx_question_is_locked" ON "question" USING btree ("is_locked");--> statement-breakpoint
CREATE INDEX "idx_question_group_paper_id" ON "question_group" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "idx_question_group_paper_section_id" ON "question_group" USING btree ("paper_section_id");--> statement-breakpoint
CREATE INDEX "idx_question_group_material_id" ON "question_group" USING btree ("material_id");--> statement-breakpoint
CREATE INDEX "idx_question_group_sort_order" ON "question_group" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_question_option_question_id" ON "question_option" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_question_option_sort_order" ON "question_option" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_scoring_point_question_id" ON "scoring_point" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_scoring_point_sort_order" ON "scoring_point" USING btree ("sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_answer_record_public_id" ON "answer_record" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_answer_record_user_id" ON "answer_record" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_answer_record_practice_id" ON "answer_record" USING btree ("practice_id");--> statement-breakpoint
CREATE INDEX "idx_answer_record_mock_exam_id" ON "answer_record" USING btree ("mock_exam_id");--> statement-breakpoint
CREATE INDEX "idx_answer_record_paper_question_id" ON "answer_record" USING btree ("paper_question_id");--> statement-breakpoint
CREATE INDEX "idx_answer_record_exam_mode" ON "answer_record" USING btree ("exam_mode");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_exam_report_public_id" ON "exam_report" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_exam_report_mock_exam_id" ON "exam_report" USING btree ("mock_exam_id");--> statement-breakpoint
CREATE INDEX "idx_exam_report_user_id" ON "exam_report" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_exam_report_paper_id" ON "exam_report" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "idx_exam_report_generated_at" ON "exam_report" USING btree ("generated_at");--> statement-breakpoint
CREATE INDEX "idx_exam_report_exam_status" ON "exam_report" USING btree ("exam_status");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_mistake_book_public_id" ON "mistake_book" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_mistake_book_user_id" ON "mistake_book" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mistake_book_question_public_id" ON "mistake_book" USING btree ("question_public_id");--> statement-breakpoint
CREATE INDEX "idx_mistake_book_profession_level_subject" ON "mistake_book" USING btree ("profession","level","subject");--> statement-breakpoint
CREATE INDEX "idx_mistake_book_latest_wrong_at" ON "mistake_book" USING btree ("latest_wrong_at");--> statement-breakpoint
CREATE INDEX "idx_mistake_book_mistake_book_status" ON "mistake_book" USING btree ("mistake_book_status");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_mock_exam_public_id" ON "mock_exam" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_mock_exam_user_id" ON "mock_exam" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mock_exam_paper_id" ON "mock_exam" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "idx_mock_exam_exam_status" ON "mock_exam" USING btree ("exam_status");--> statement-breakpoint
CREATE INDEX "idx_mock_exam_started_at" ON "mock_exam" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_mock_exam_server_deadline_at" ON "mock_exam" USING btree ("server_deadline_at");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_practice_public_id" ON "practice" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_practice_user_id" ON "practice" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_practice_paper_id" ON "practice" USING btree ("paper_id");--> statement-breakpoint
CREATE INDEX "idx_practice_user_id_paper_id_practice_status" ON "practice" USING btree ("user_id","paper_id","practice_status");--> statement-breakpoint
CREATE INDEX "idx_practice_expires_at" ON "practice" USING btree ("expires_at");