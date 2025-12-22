-- Add parent mode fields to users table
ALTER TABLE users ADD COLUMN parent_mode_pin VARCHAR(255);
ALTER TABLE users ADD COLUMN is_parent_mode BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN pin_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN pin_reset_token_expiry TIMESTAMP;

-- Create index on pin_reset_token for faster lookups
CREATE INDEX idx_users_pin_reset_token ON users(pin_reset_token);
