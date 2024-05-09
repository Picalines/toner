ALTER TABLE "node_connection" DROP CONSTRAINT "node_connection_composition_id_composition_id_fk";
--> statement-breakpoint
ALTER TABLE "node_connection" DROP CONSTRAINT "node_connection_composition_id_sender_id_receiver_id_output_socket_input_socket_pk";--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "sender_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "receiver_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "output_socket" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "input_socket" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "node_connection" ADD CONSTRAINT "node_connection_sender_id_receiver_id_output_socket_input_socket_pk" PRIMARY KEY("sender_id","receiver_id","output_socket","input_socket");--> statement-breakpoint
ALTER TABLE "node_connection" DROP COLUMN IF EXISTS "composition_id";