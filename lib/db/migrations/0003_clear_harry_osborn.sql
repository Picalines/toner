ALTER TABLE "user" RENAME TO "account";--> statement-breakpoint
ALTER TABLE "author" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
ALTER TABLE "listener" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "user_id" TO "account_id";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "user_login_unique";--> statement-breakpoint
ALTER TABLE "author" DROP CONSTRAINT "author_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "listen" DROP CONSTRAINT "listen_listener_id_listener_user_id_fk";
--> statement-breakpoint
ALTER TABLE "listener" DROP CONSTRAINT "listener_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "reaction" DROP CONSTRAINT "reaction_listener_id_listener_user_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_listener_id_listener_user_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_author_id_author_user_id_fk";
--> statement-breakpoint
ALTER TABLE "track_project" DROP CONSTRAINT "track_project_author_id_author_user_id_fk";
--> statement-breakpoint
ALTER TABLE "track_publication" DROP CONSTRAINT "track_publication_author_id_author_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "author" ADD CONSTRAINT "author_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listen" ADD CONSTRAINT "listen_listener_id_listener_account_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listener"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "listener" ADD CONSTRAINT "listener_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reaction" ADD CONSTRAINT "reaction_listener_id_listener_account_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listener"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_listener_id_listener_account_id_fk" FOREIGN KEY ("listener_id") REFERENCES "listener"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_project" ADD CONSTRAINT "track_project_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track_publication" ADD CONSTRAINT "track_publication_author_id_author_account_id_fk" FOREIGN KEY ("author_id") REFERENCES "author"("account_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_login_unique" UNIQUE("login");