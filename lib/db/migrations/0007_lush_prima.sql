ALTER TABLE "note_layer" RENAME TO "key_layer";--> statement-breakpoint
ALTER TABLE "note" RENAME TO "key";--> statement-breakpoint
ALTER TABLE "key" RENAME COLUMN "instrumentNode_id" TO "synth_node_id";--> statement-breakpoint
ALTER TABLE "key" RENAME COLUMN "start_at" TO "time";--> statement-breakpoint
ALTER TABLE "key_layer" DROP CONSTRAINT "note_layer_project_id_track_project_id_fk";
--> statement-breakpoint
ALTER TABLE "key" DROP CONSTRAINT "note_layer_id_note_layer_id_fk";
--> statement-breakpoint
ALTER TABLE "key" DROP CONSTRAINT "note_instrumentNode_id_node_id_fk";
--> statement-breakpoint
ALTER TABLE "key" ADD COLUMN "velocity" real NOT NULL;--> statement-breakpoint
ALTER TABLE "key" ADD COLUMN "note" smallint NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "key_layer" ADD CONSTRAINT "key_layer_project_id_track_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "key" ADD CONSTRAINT "key_layer_id_key_layer_id_fk" FOREIGN KEY ("layer_id") REFERENCES "key_layer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "key" ADD CONSTRAINT "key_synth_node_id_node_id_fk" FOREIGN KEY ("synth_node_id") REFERENCES "node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "key" DROP COLUMN IF EXISTS "frequency";