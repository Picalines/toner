ALTER TABLE "node_connection" ALTER COLUMN "project_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "sender_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "receiver_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "output_socket" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "input_socket" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" DROP COLUMN IF EXISTS "id";
ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_project_id_sender_id_receiver_id_output_socket_input_socket_pk" PRIMARY KEY("project_id","sender_id","receiver_id","output_socket","input_socket");--> statement-breakpoint
