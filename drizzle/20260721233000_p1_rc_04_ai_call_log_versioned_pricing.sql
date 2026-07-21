ALTER TABLE "model_config" ADD COLUMN "pricing_version" text;--> statement-breakpoint
ALTER TABLE "model_config" ADD COLUMN "input_token_price_cny_per_million" numeric(18, 6);--> statement-breakpoint
ALTER TABLE "model_config" ADD COLUMN "output_token_price_cny_per_million" numeric(18, 6);--> statement-breakpoint
ALTER TABLE "model_config" ADD CONSTRAINT "model_config_pricing_tuple_check" CHECK ((
        "model_config"."pricing_version" is null
        and "model_config"."input_token_price_cny_per_million" is null
        and "model_config"."output_token_price_cny_per_million" is null
      ) or (
        "model_config"."pricing_version" is not null
        and "model_config"."input_token_price_cny_per_million" is not null
        and "model_config"."output_token_price_cny_per_million" is not null
        and "model_config"."input_token_price_cny_per_million" >= 0
        and "model_config"."output_token_price_cny_per_million" >= 0
      ));