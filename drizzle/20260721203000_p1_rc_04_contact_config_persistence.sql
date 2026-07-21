CREATE TABLE "contact_config" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contact_config_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"singleton_key" text DEFAULT 'purchase_guidance' NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"channels" jsonb NOT NULL,
	"safety_notice" text NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"updated_by_admin_public_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_config_qr_image" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "contact_config_qr_image_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"public_id" text NOT NULL,
	"content_type" text NOT NULL,
	"bytes_base64" text NOT NULL,
	"byte_size" integer NOT NULL,
	"created_by_admin_public_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "udx_contact_config_public_id" ON "contact_config" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_contact_config_singleton_key" ON "contact_config" USING btree ("singleton_key");--> statement-breakpoint
CREATE UNIQUE INDEX "udx_contact_config_qr_image_public_id" ON "contact_config_qr_image" USING btree ("public_id");--> statement-breakpoint
CREATE INDEX "idx_contact_config_qr_image_created_at" ON "contact_config_qr_image" USING btree ("created_at");--> statement-breakpoint
INSERT INTO "contact_config" (
	"public_id",
	"singleton_key",
	"title",
	"summary",
	"channels",
	"safety_notice",
	"revision",
	"updated_by_admin_public_id"
) VALUES (
	'contact-config-purchase-guidance',
	'purchase_guidance',
	'购买支持',
	'没有可用授权或卡密时，请联系 Tiku 运营支持获取购买方式与开通流程。',
	'[{"channelType":"phone","isEnabled":true,"label":"Tiku 运营支持","qrImageUrl":null,"value":"400-000-2026","serviceHours":"工作日 09:00-18:00","usage":"购买咨询、卡密开通、授权范围确认","href":"tel:4000002026"}]'::jsonb,
	'请勿在沟通中提供密码、验证码、卡密明文或个人隐私数据。',
	1,
	'system-migration'
);
