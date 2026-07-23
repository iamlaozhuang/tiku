ALTER TABLE "admin_ai_generation_formal_adoption" ADD COLUMN "knowledge_node_candidate_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD COLUMN "knowledge_node_candidate_digest" text;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD COLUMN "knowledge_node_resolution_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD COLUMN "knowledge_node_resolution_digest" text;--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD CONSTRAINT "chk_admin_ai_formal_adoption_kn_resolution_coherence" CHECK ((
        ("admin_ai_generation_formal_adoption"."knowledge_node_candidate_snapshot" is null and "admin_ai_generation_formal_adoption"."knowledge_node_candidate_digest" is null and "admin_ai_generation_formal_adoption"."knowledge_node_resolution_snapshot" is null and "admin_ai_generation_formal_adoption"."knowledge_node_resolution_digest" is null)
        or
        ("admin_ai_generation_formal_adoption"."knowledge_node_candidate_snapshot" is not null and jsonb_typeof("admin_ai_generation_formal_adoption"."knowledge_node_candidate_snapshot") = 'object' and "admin_ai_generation_formal_adoption"."knowledge_node_candidate_digest" is not null and "admin_ai_generation_formal_adoption"."knowledge_node_resolution_snapshot" is not null and jsonb_typeof("admin_ai_generation_formal_adoption"."knowledge_node_resolution_snapshot") = 'object' and "admin_ai_generation_formal_adoption"."knowledge_node_resolution_digest" is not null)
      ));--> statement-breakpoint
ALTER TABLE "admin_ai_generation_formal_adoption" ADD CONSTRAINT "chk_admin_ai_formal_adoption_kn_digest_format" CHECK ((
        ("admin_ai_generation_formal_adoption"."knowledge_node_candidate_digest" is null or "admin_ai_generation_formal_adoption"."knowledge_node_candidate_digest" ~ '^sha256:[0-9a-f]{64}$')
        and
        ("admin_ai_generation_formal_adoption"."knowledge_node_resolution_digest" is null or "admin_ai_generation_formal_adoption"."knowledge_node_resolution_digest" ~ '^sha256:[0-9a-f]{64}$')
      ));