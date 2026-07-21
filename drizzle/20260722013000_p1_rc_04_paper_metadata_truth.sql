CREATE TYPE "public"."paper_generation_method" AS ENUM('manual', 'ai', 'mixed');--> statement-breakpoint
ALTER TABLE "paper" ADD COLUMN "month" integer;--> statement-breakpoint
ALTER TABLE "paper" ADD COLUMN "source_region" text;--> statement-breakpoint
ALTER TABLE "paper" ADD COLUMN "source_organization" text;--> statement-breakpoint
ALTER TABLE "paper" ADD COLUMN "question_basis" text;--> statement-breakpoint
ALTER TABLE "paper" ADD COLUMN "generation_method" "paper_generation_method";