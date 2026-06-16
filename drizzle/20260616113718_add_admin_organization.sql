CREATE TABLE "admin_organization" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_organization_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"admin_id" bigint NOT NULL,
	"organization_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_organization" ADD CONSTRAINT "admin_organization_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_organization" ADD CONSTRAINT "admin_organization_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "udx_admin_organization_admin_id_organization_id" ON "admin_organization" USING btree ("admin_id","organization_id");--> statement-breakpoint
CREATE INDEX "idx_admin_organization_admin_id" ON "admin_organization" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "idx_admin_organization_organization_id" ON "admin_organization" USING btree ("organization_id");
