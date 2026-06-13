ALTER TABLE "personal_ai_generation_result" DROP CONSTRAINT "personal_ai_generation_result_ai_generation_task_id_ai_generation_task_id_fk";
--> statement-breakpoint
ALTER TABLE "personal_ai_generation_result" ADD CONSTRAINT "fk_personal_ai_generation_result_task" FOREIGN KEY ("ai_generation_task_id") REFERENCES "public"."ai_generation_task"("id") ON DELETE restrict ON UPDATE no action;