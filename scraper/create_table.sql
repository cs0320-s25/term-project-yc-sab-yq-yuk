-- BrunoMap PostgreSQL Schema (Supabase-compatible)
-- Run this in Supabase SQL Editor or via psql

CREATE TABLE IF NOT EXISTS events (
    event_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    timezone VARCHAR(10),
    location VARCHAR(255),
    description TEXT,
    event_type VARCHAR(100),
    link VARCHAR(512),
    latitude REAL,
    longitude REAL,
    liked_count INT DEFAULT 0 NOT NULL CHECK (liked_count >= 0),
    viewed_count INT DEFAULT 0 NOT NULL CHECK (viewed_count >= 0),
    trending_score REAL DEFAULT 0.0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_time ON events (start_time);

CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS event_categories (
    event_id INT,
    category_id INT,
    PRIMARY KEY (event_id, category_id),
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    user_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_likes (
    user_id VARCHAR(255),
    event_id INT,
    timestamp TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_bookmarks (
    user_id VARCHAR(255),
    event_id INT,
    PRIMARY KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_category_frequencies (
    user_id VARCHAR(255),
    category_id INT,
    frequency INT DEFAULT 0 NOT NULL CHECK (frequency >= 0),
    PRIMARY KEY (user_id, category_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);