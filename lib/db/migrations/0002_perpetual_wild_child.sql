ALTER TABLE "user" ADD COLUMN "hashed_password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_login_unique" UNIQUE("login");