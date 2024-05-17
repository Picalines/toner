CREATE TABLE IF NOT EXISTS "audio_edge" (
	"composition_id" integer NOT NULL,
	"id" varchar(36) NOT NULL,
	"source_id" varchar(36) NOT NULL,
	"target_id" varchar(36) NOT NULL,
	"source_socket" integer DEFAULT 0 NOT NULL,
	"target_socket" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "audio_edge_composition_id_id_pk" PRIMARY KEY("composition_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audio_node" (
	"composition_id" integer NOT NULL,
	"id" varchar(36) NOT NULL,
	"type" varchar(32) NOT NULL,
	"label" varchar(32),
	"center_x" double precision DEFAULT 0 NOT NULL,
	"center_y" double precision DEFAULT 0 NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "primary_key" PRIMARY KEY("composition_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "music_key_layer" (
	"composition_id" integer NOT NULL,
	"id" varchar(36) NOT NULL,
	"name" varchar(32) NOT NULL,
	CONSTRAINT "music_key_layer_composition_id_id_pk" PRIMARY KEY("composition_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "music_key" (
	"composition_id" integer NOT NULL,
	"layer_id" varchar(36) NOT NULL,
	"id" varchar(36) NOT NULL,
	"instrument_id" integer NOT NULL,
	"time" integer NOT NULL,
	"duration" integer NOT NULL,
	"velocity" real NOT NULL,
	"note" smallint NOT NULL,
	CONSTRAINT "music_key_composition_id_layer_id_id_pk" PRIMARY KEY("composition_id","layer_id","id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audio_edge" ADD CONSTRAINT "audio_edge_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audio_node" ADD CONSTRAINT "audio_node_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "music_key_layer" ADD CONSTRAINT "music_key_layer_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "music_key" ADD CONSTRAINT "composition_layer_key" FOREIGN KEY ("composition_id","layer_id") REFERENCES "public"."music_key_layer"("composition_id","id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
