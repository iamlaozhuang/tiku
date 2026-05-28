CREATE TABLE "question_knowledge_node" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_knowledge_node_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"knowledge_node_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_tag" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_tag_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"tag_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tag_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_knowledge_node" ADD CONSTRAINT "question_knowledge_node_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_knowledge_node" ADD CONSTRAINT "question_knowledge_node_knowledge_node_id_knowledge_node_id_fk" FOREIGN KEY ("knowledge_node_id") REFERENCES "public"."knowledge_node"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_tag" ADD CONSTRAINT "question_tag_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_tag" ADD CONSTRAINT "question_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_question_knowledge_node_question_id_knowledge_node_id" ON "question_knowledge_node" USING btree ("question_id","knowledge_node_id");--> statement-breakpoint
CREATE INDEX "idx_question_knowledge_node_question_id" ON "question_knowledge_node" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_question_knowledge_node_knowledge_node_id" ON "question_knowledge_node" USING btree ("knowledge_node_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_question_tag_question_id_tag_id" ON "question_tag" USING btree ("question_id","tag_id");--> statement-breakpoint
CREATE INDEX "idx_question_tag_question_id" ON "question_tag" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_question_tag_tag_id" ON "question_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_tag_public_id" ON "tag" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_tag_name" ON "tag" USING btree ("name");