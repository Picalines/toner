ALTER TABLE "track_project" RENAME TO "composition";--> statement-breakpoint
ALTER TABLE "track_publication" RENAME TO "publication";--> statement-breakpoint
ALTER TABLE "key_layer" RENAME COLUMN "project_id" TO "composition_id";--> statement-breakpoint
ALTER TABLE "node_connection" RENAME COLUMN "project_id" TO "composition_id";--> statement-breakpoint
ALTER TABLE "node" RENAME COLUMN "project_id" TO "composition_id";--> statement-breakpoint
ALTER TABLE "publication" RENAME COLUMN "project_id" TO "composition_id";--> statement-breakpoint
ALTER TABLE "key_layer" DROP CONSTRAINT "key_layer_project_id_track_project_id_fk";
--> statement-breakpoint
ALTER TABLE "listen" DROP CONSTRAINT "listen_publication_id_track_publication_id_fk";
--> statement-breakpoint
ALTER TABLE "node_connection" DROP CONSTRAINT "node_connection_project_id_track_project_id_fk";
--> statement-breakpoint
ALTER TABLE "node" DROP CONSTRAINT "node_project_id_track_project_id_fk";
--> statement-breakpoint
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_publication_id_track_publication_id_fk";
--> statement-breakpoint
ALTER TABLE "composition" DROP CONSTRAINT "track_project_author_id_author_account_id_fk";
--> statement-breakpoint
ALTER TABLE "publication" DROP CONSTRAINT "track_publication_author_id_author_account_id_fk";
--> statement-breakpoint
ALTER TABLE "publication" DROP CONSTRAINT "track_publication_project_id_track_project_id_fk";
--> statement-breakpoint
ALTER TABLE "node_connection" DROP CONSTRAINT "node_connection_project_id_sender_id_receiver_id_output_socket_input_socket_pk";--> statement-breakpoint
ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_composition_id_sender_id_receiver_id_output_socket_input_socket_pk" PRIMARY KEY("composition_id","sender_id","receiver_id","output_socket","input_socket");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "key_layer" ADD CONSTRAINT "key_layer_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listen" ADD CONSTRAINT "listen_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publication"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node" ADD CONSTRAINT "node_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_publication_id_publication_id_fk" FOREIGN KEY ("publication_id") REFERENCES "publication"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "composition" ADD CONSTRAINT "composition_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publication" ADD CONSTRAINT "publication_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "publication" ADD CONSTRAINT "publication_composition_id_composition_id_fk" FOREIGN KEY ("composition_id") REFERENCES "composition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
