ALTER TABLE "node_edge" RENAME COLUMN "sender_id" TO "source_id";--> statement-breakpoint
ALTER TABLE "node_edge" RENAME COLUMN "receiver_id" TO "target_id";--> statement-breakpoint
ALTER TABLE "node_edge" RENAME COLUMN "output_socket" TO "source_socket";--> statement-breakpoint
ALTER TABLE "node_edge" RENAME COLUMN "input_socket" TO "target_socket";