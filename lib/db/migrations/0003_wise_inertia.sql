CREATE TABLE "rateLimit" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"count" integer NOT NULL,
	"last_request" timestamp NOT NULL,
	CONSTRAINT "rateLimit_key_unique" UNIQUE("key")
);
