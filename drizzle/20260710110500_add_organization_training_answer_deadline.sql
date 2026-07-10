ALTER TABLE "organization_training_version" ADD COLUMN "answer_deadline_at" timestamp with time zone;
CREATE INDEX "idx_organization_training_version_answer_deadline" ON "organization_training_version" USING btree ("answer_deadline_at");
