DROP TABLE "node_socket" CASCADE;--> statement-breakpoint
ALTER TABLE "node_connection" DROP CONSTRAINT IF EXISTS "node_connection_sender_id_node_socket_id_fk";
--> statement-breakpoint
ALTER TABLE "node_connection" DROP CONSTRAINT IF EXISTS "node_connection_receiver_id_node_socket_id_fk";
--> statement-breakpoint
ALTER TABLE "node_connection" ADD COLUMN "output_socket" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ADD COLUMN "input_socket" integer NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_sender_id_node_id_fk" FOREIGN KEY ("sender_id") REFERENCES "node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_receiver_id_node_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
