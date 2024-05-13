DO $$ BEGIN
 CREATE TYPE "public"."reaction_type" AS ENUM('heart', 'brokenHeart', 'smile', 'laugh');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"login" varchar(32) NOT NULL,
	"hashed_password" text NOT NULL,
	"display_name" varchar(64) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_login_unique" UNIQUE("login")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "author" (
	"account_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "composition" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "key_layer" (
	"id" serial PRIMARY KEY NOT NULL,
	"composition_id" integer NOT NULL,
	"name" varchar(32) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "key" (
	"id" serial PRIMARY KEY NOT NULL,
	"layer_id" integer NOT NULL,
	"instrument_id" integer NOT NULL,
	"time" integer NOT NULL,
	"duration" integer NOT NULL,
	"velocity" real NOT NULL,
	"note" smallint NOT NULL
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
	"account_id" integer PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node_connection" (
	"composition_id" integer NOT NULL,
	"id" varchar(36) NOT NULL,
	"sender_id" varchar(36) NOT NULL,
	"receiver_id" varchar(36) NOT NULL,
	"output_socket" integer NOT NULL,
	"input_socket" integer NOT NULL,
	CONSTRAINT "node_connection_composition_id_id_pk" PRIMARY KEY("composition_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "node" (
	"composition_id" integer NOT NULL,
	"id" varchar(36) NOT NULL,
	"type" varchar(32) NOT NULL,
	"display_name" varchar(32),
	"center_x" double precision NOT NULL,
	"center_y" double precision NOT NULL,
	"properties" jsonb NOT NULL,
	CONSTRAINT "primary_key" PRIMARY KEY("composition_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "publication" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer NOT NULL,
	"composition_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"listener_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_listener_id_author_id_pk" PRIMARY KEY("listener_id","author_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "author" ADD CONSTRAINT "author_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "composition" ADD CONSTRAINT "composition_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "key_layer" ADD CONSTRAINT "key_layer_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "key" ADD CONSTRAINT "key_layer_id_key_layer_id_fk" FOREIGN KEY ("layer_id") REFERENCES "public"."key_layer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listen" ADD CONSTRAINT "listen_listener_id_listener_account_id_fk" FOREIGN KEY ("listener_id") REFERENCES "public"."listener"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listen" ADD CONSTRAINT "listen_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publication"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listener" ADD CONSTRAINT "listener_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node" ADD CONSTRAINT "node_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publication" ADD CONSTRAINT "publication_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publication" ADD CONSTRAINT "publication_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "public"."composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_listener_id_listener_account_id_fk" FOREIGN KEY ("listener_id") REFERENCES "public"."listener"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publication"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_listener_id_listener_account_id_fk" FOREIGN KEY ("listener_id") REFERENCES "public"."listener"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
