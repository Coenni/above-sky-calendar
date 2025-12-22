-- Migration: Initial database schema
-- Description: Creates all tables for the Above Sky Calendar application
-- Author: System
-- Date: 2025-12-22

-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    roles VARCHAR(255) NOT NULL DEFAULT 'ROLE_USER',
    display_name VARCHAR(255),
    color VARCHAR(255),
    age INTEGER,
    is_parent BOOLEAN DEFAULT false,
    reward_points INTEGER DEFAULT 0,
    preferred_locale VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL,
    category VARCHAR(255),
    color VARCHAR(255),
    is_all_day BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(255),
    assigned_members VARCHAR(255),
    reminder_minutes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    due_date TIMESTAMP,
    assigned_user_id BIGINT,
    priority VARCHAR(255) NOT NULL DEFAULT 'medium',
    status VARCHAR(255) NOT NULL DEFAULT 'pending',
    category VARCHAR(255),
    recurrence_pattern VARCHAR(255),
    reward_points INTEGER DEFAULT 0,
    subtasks VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rewards table
CREATE TABLE rewards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    points_cost INTEGER NOT NULL,
    category VARCHAR(255),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Reward Redemptions table
CREATE TABLE reward_redemptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    reward_id BIGINT NOT NULL,
    points_spent INTEGER NOT NULL,
    status VARCHAR(255) DEFAULT 'pending',
    notes VARCHAR(1000),
    redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meals table
CREATE TABLE meals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    recipe VARCHAR(5000),
    ingredients VARCHAR(255),
    assigned_date DATE,
    dietary_tags VARCHAR(255),
    image_url VARCHAR(255),
    is_favorite BOOLEAN DEFAULT false,
    created_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    comments VARCHAR(2000),
    event_id BIGINT,
    photo_date TIMESTAMP,
    uploaded_by BIGINT,
    tags VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Lists table
CREATE TABLE lists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    is_shared BOOLEAN DEFAULT true,
    created_by BIGINT,
    is_archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- List Items table
CREATE TABLE list_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    list_id BIGINT NOT NULL,
    content VARCHAR(255) NOT NULL,
    is_checked BOOLEAN DEFAULT false,
    priority VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    added_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for foreign keys and commonly queried columns
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_tasks_assigned_user_id ON tasks(assigned_user_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);
CREATE INDEX idx_photos_event_id ON photos(event_id);
CREATE INDEX idx_list_items_list_id ON list_items(list_id);
CREATE INDEX idx_users_preferred_locale ON users(preferred_locale);
