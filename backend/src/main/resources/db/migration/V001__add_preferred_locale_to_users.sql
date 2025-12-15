-- Migration: Add preferred_locale column to users table
-- Description: Adds support for user language preference for internationalization
-- Author: System
-- Date: 2024-12-15

-- Add preferred_locale column with default value 'en' (English)
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_locale VARCHAR(5) DEFAULT 'en';

-- Add comment to the column
COMMENT ON COLUMN users.preferred_locale IS 'User preferred language (en, de, tr, fr, az)';

-- Create index for faster lookups (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_users_preferred_locale ON users(preferred_locale);

-- Update existing users to have default locale if NULL
UPDATE users SET preferred_locale = 'en' WHERE preferred_locale IS NULL;
