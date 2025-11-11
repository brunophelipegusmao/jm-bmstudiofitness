-- Migration: Add Waitlist System
-- Description: Adds waitlist_enabled field to studio settings and creates waitlist table

-- Add waitlist_enabled to studio settings
ALTER TABLE "tb_studio_settings" ADD COLUMN "waitlist_enabled" boolean DEFAULT false NOT NULL;

-- Create waitlist table
CREATE TABLE IF NOT EXISTS "tb_waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"whatsapp" text NOT NULL,
	"preferred_shift" text NOT NULL,
	"goal" text NOT NULL,
	"health_restrictions" text,
	"position" integer NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"enrolled_at" timestamp,
	"user_id" uuid
);

-- Add foreign key constraint
ALTER TABLE "tb_waitlist" ADD CONSTRAINT "tb_waitlist_user_id_tb_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "tb_users"("id") ON DELETE no action ON UPDATE no action;

-- Create index on position for faster queries
CREATE INDEX IF NOT EXISTS "waitlist_position_idx" ON "tb_waitlist" ("position");

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS "waitlist_status_idx" ON "tb_waitlist" ("status");
