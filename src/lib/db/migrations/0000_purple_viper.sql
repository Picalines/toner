DO $$ BEGIN
 CREATE TYPE "node_socket_type" AS ENUM('input', 'output');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "reaction_type" AS ENUM('heart', 'brokenHeart', 'smile', 'laugh');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "author" (
	"user_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listen" (
	"listener_id" integer NOT NULL,
	"publication_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "listen_listener_id_publication_id_pk" PRIMARY KEY("listener_id","publication_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listener" (
	"user_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node_connection" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node_socket" (
	"id" serial PRIMARY KEY NOT NULL,
	"node_id" integer NOT NULL,
	"type" "node_socket_type" NOT NULL,
	"name" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type" varchar(32) NOT NULL,
	"display_name" varchar(32)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "note_layer" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "note" (
	"id" serial PRIMARY KEY NOT NULL,
	"layer_id" integer NOT NULL,
	"instrumentNode_id" integer NOT NULL,
	"start_at" integer NOT NULL,
	"duration" integer NOT NULL,
	"frequency" numeric(9, 3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reaction" (
	"listener_id" integer NOT NULL,
	"publication_id" integer NOT NULL,
	"type" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reaction_listener_id_publication_id_pk" PRIMARY KEY("listener_id","publication_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"listener_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_listener_id_author_id_pk" PRIMARY KEY("listener_id","author_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "track_project" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "track_publication" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"login" varchar(32) NOT NULL,
	"display_name" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "author" ADD CONSTRAINT "author_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listen" ADD CONSTRAINT "listen_listener_id_listener_user_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listener"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listen" ADD CONSTRAINT "listen_publication_id_track_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "track_publication"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listener" ADD CONSTRAINT "listener_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_project_id_track_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_sender_id_node_socket_id_fk" FOREIGN KEY ("sender_id") REFERENCES "node_socket"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_receiver_id_node_socket_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "node_socket"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_socket" ADD CONSTRAINT "node_socket_node_id_node_id_fk" FOREIGN KEY ("node_id") REFERENCES "node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node" ADD CONSTRAINT "node_project_id_track_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note_layer" ADD CONSTRAINT "note_layer_project_id_track_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_layer_id_note_layer_id_fk" FOREIGN KEY ("layer_id") REFERENCES "note_layer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note" ADD CONSTRAINT "note_instrumentNode_id_node_id_fk" FOREIGN KEY ("instrumentNode_id") REFERENCES "node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_listener_id_listener_user_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listener"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_publication_id_track_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "track_publication"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_listener_id_listener_user_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listener"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_author_id_author_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_project" ADD CONSTRAINT "track_project_author_id_author_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_publication" ADD CONSTRAINT "track_publication_author_id_author_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_publication" ADD CONSTRAINT "track_publication_project_id_track_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
