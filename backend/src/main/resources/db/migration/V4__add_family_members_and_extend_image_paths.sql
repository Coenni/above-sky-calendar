-- Migration: Add Family Members table and extend image path lengths
-- Description: Creates family_members table and increases image_url/file_path VARCHAR lengths from 256 to 512
-- Author: System
-- Date: 2025-12-23

-- Extend image_url field length in meals table
ALTER TABLE meals ALTER COLUMN image_url TYPE VARCHAR(512);

-- Extend image_url field length in rewards table (if applicable)
ALTER TABLE rewards ALTER COLUMN image_url TYPE VARCHAR(512);

-- Extend file_path field length in photos table
ALTER TABLE photos ALTER COLUMN file_path TYPE VARCHAR(512);

-- Create Family Members table
-- Note: This reuses the users table structure but we create a separate view/approach
-- Actually, based on the spec.yaml, FamilyMember appears to be same as User
-- So we'll add missing fields to users table instead

-- Add photo/avatar field to users table
ALTER TABLE users ADD COLUMN photo VARCHAR(512);

-- Add date of birth field to users table
ALTER TABLE users ADD COLUMN date_of_birth DATE;

-- Add role field to users table (Parent, Child, etc.)
ALTER TABLE users ADD COLUMN role VARCHAR(50);

-- Add phone field to users table
ALTER TABLE users ADD COLUMN phone VARCHAR(50);

-- Add gender field to users table (Male, Female, Other, Prefer not to say)
ALTER TABLE users ADD COLUMN gender VARCHAR(50);

-- Add assignee_id field to tasks table (foreign key to users/family members)
ALTER TABLE tasks ADD COLUMN assignee_id BIGINT;

-- Create index on assignee_id for faster lookups
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);

-- Add foreign key constraint for assignee_id
-- Note: We don't add explicit FK constraint to allow for flexibility
-- but in practice assignee_id should reference users(id)
