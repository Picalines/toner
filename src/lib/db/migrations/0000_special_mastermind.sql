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
CREATE TABLE IF NOT EXISTS "authors" (
	"user_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listeners" (
	"user_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "listens" (
	"listener_id" integer NOT NULL,
	"publication_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "listens_listener_id_publication_id_pk" PRIMARY KEY("listener_id","publication_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node_sockets" (
	"id" serial PRIMARY KEY NOT NULL,
	"node_id" integer NOT NULL,
	"type" "node_socket_type" NOT NULL,
	"name" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"type" varchar(32) NOT NULL,
	"display_name" varchar(32)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "note_layers" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"layer_id" integer NOT NULL,
	"instrumentNode_id" integer NOT NULL,
	"start_at" integer NOT NULL,
	"duration" integer NOT NULL,
	"frequency" numeric(9, 3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reactions" (
	"listener_id" integer NOT NULL,
	"publication_id" integer NOT NULL,
	"type" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_listener_id_publication_id_pk" PRIMARY KEY("listener_id","publication_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"listener_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_listener_id_author_id_pk" PRIMARY KEY("listener_id","author_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "track_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "track_publications" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"login" varchar(32) NOT NULL,
	"display_name" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "authors" ADD CONSTRAINT "authors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listeners" ADD CONSTRAINT "listeners_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listens" ADD CONSTRAINT "listens_listener_id_listeners_user_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listeners"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listens" ADD CONSTRAINT "listens_publication_id_track_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "track_publications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connections" ADD CONSTRAINT "node_connections_project_id_track_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connections" ADD CONSTRAINT "node_connections_sender_id_node_sockets_id_fk" FOREIGN KEY ("sender_id") REFERENCES "node_sockets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connections" ADD CONSTRAINT "node_connections_receiver_id_node_sockets_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "node_sockets"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_sockets" ADD CONSTRAINT "node_sockets_node_id_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nodes" ADD CONSTRAINT "nodes_project_id_track_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "note_layers" ADD CONSTRAINT "note_layers_project_id_track_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_layer_id_note_layers_id_fk" FOREIGN KEY ("layer_id") REFERENCES "note_layers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notes" ADD CONSTRAINT "notes_instrumentNode_id_nodes_id_fk" FOREIGN KEY ("instrumentNode_id") REFERENCES "nodes"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_listener_id_listeners_user_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listeners"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reactions" ADD CONSTRAINT "reactions_publication_id_track_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "track_publications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_listener_id_listeners_user_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listeners"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_author_id_authors_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "authors"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_projects" ADD CONSTRAINT "track_projects_author_id_authors_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "authors"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_publications" ADD CONSTRAINT "track_publications_author_id_authors_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "authors"("user_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_publications" ADD CONSTRAINT "track_publications_project_id_track_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "track_projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
