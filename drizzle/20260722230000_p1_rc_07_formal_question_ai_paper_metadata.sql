CREATE TYPE "public"."question_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
ALTER TABLE "question" ADD COLUMN "difficulty" "question_difficulty";