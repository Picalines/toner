ALTER TABLE "session" RENAME COLUMN "account_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_account_id_account_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
