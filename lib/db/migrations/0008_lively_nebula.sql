ALTER TABLE "music_key_layer" RENAME TO "music_layer";--> statement-breakpoint
ALTER TABLE "music_key" DROP CONSTRAINT "composition_layer_key";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "music_key" ADD CONSTRAINT "composition_layer_key" FOREIGN KEY ("composition_id","layer_id") REFERENCES "public"."music_layer"("composition_id","id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
