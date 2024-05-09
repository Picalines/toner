CREATE TABLE IF NOT EXISTS "node_property" (
	"node_id" integer,
	"name" varchar(32),
	"value" real NOT NULL,
	CONSTRAINT "node_property_node_id_name_pk" PRIMARY KEY("node_id","name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "node_property" ADD CONSTRAINT "node_property_node_id_node_id_fk" FOREIGN KEY ("node_id") REFERENCES "node"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
