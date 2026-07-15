CREATE INDEX "idx_resource_chunk_keyword_token_list" ON "resource_chunk" USING gin ("keyword_token_list");--> statement-breakpoint
CREATE INDEX "idx_resource_chunk_embedding_cosine" ON "resource_chunk" USING hnsw ("embedding" vector_cosine_ops);
