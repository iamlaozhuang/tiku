ALTER TYPE "public"."ai_call_status" ADD VALUE 'running' BEFORE 'success';--> statement-breakpoint
ALTER TYPE "public"."ai_func_type" ADD VALUE 'ai_question_generation';--> statement-breakpoint
ALTER TYPE "public"."ai_func_type" ADD VALUE 'ai_paper_generation';