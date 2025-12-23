-- Migration: Add icon fields to entities
-- Description: Adds icon/emoji field to tasks, events, meals, rewards, and lists for child-friendly UI
-- Author: System
-- Date: 2025-12-23

-- Add icon field to tasks table
ALTER TABLE tasks ADD COLUMN icon VARCHAR(50);

-- Add icon field to events table
ALTER TABLE events ADD COLUMN icon VARCHAR(50);

-- Add icon field to meals table
ALTER TABLE meals ADD COLUMN icon VARCHAR(50);

-- Add icon field to rewards table
ALTER TABLE rewards ADD COLUMN icon VARCHAR(50);

-- Add icon field to lists table
ALTER TABLE lists ADD COLUMN icon VARCHAR(50);
