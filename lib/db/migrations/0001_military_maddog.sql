ALTER TABLE "node" RENAME COLUMN "display_name" TO "label";--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "output_socket" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "node_connection" ALTER COLUMN "input_socket" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "node" ALTER COLUMN "center_x" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "node" ALTER COLUMN "center_y" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "node" ALTER COLUMN "properties" SET DEFAULT '{}'::jsonb;