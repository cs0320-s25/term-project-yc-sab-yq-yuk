CREATE DATABASE IF NOT EXISTS map_db;
USE map_db;

CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,             
    name VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,              -- Start datetime
    end_time DATETIME,                         -- End datetime, nullable
    timezone VARCHAR(10),                         -- Optional timezone info
    location VARCHAR(255),
    description TEXT,
    event_type VARCHAR(100),                      -- Optional: could be normalized if repeated
    link VARCHAR(512),
    latitude FLOAT,
    longitude FLOAT,
    liked_count INT UNSIGNED DEFAULT 0 NOT NULL,
    viewed_count INT UNSIGNED DEFAULT 0 NOT NULL,
    trending_score FLOAT DEFAULT 0.0 NOT NULL,
    INDEX idx_event_time (start_time)
);

CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY, -- Auto-generated unique ID for each category
    category_name VARCHAR(100) NOT NULL UNIQUE  -- The name of the category, must be unique
);

CREATE TABLE event_categories (
    event_id INT, -- Foreign Key referencing events.event_id
    category_id INT,       -- Foreign Key referencing categories.category_id
    PRIMARY KEY (event_id, category_id), -- Composite primary key to ensure uniqueness of the pair
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE, -- If an event is deleted, remove its category links
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE -- If a category is deleted, remove its event links
);


CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY, -- Unique identifier from Clerk (assuming strings)
    email VARCHAR(255) UNIQUE,        -- Optional email (can be NULL), unique if present
    user_name VARCHAR(255)            -- Optional user name (can be NULL)
);

CREATE TABLE user_likes (
    user_id VARCHAR(255),    -- Foreign Key referencing users.user_id
    event_id INT,            -- Foreign Key referencing events.event_id
    timestamp DATETIME NOT NULL, -- When the like occurred
    PRIMARY KEY (user_id, event_id), -- A user can like an event only once (at a time)
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE user_bookmarks (
    user_id VARCHAR(255),    -- Foreign Key referencing users.user_id
    event_id INT,            -- Foreign Key referencing events.event_id
    PRIMARY KEY (user_id, event_id), -- A user can bookmark an event only once
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
);

CREATE TABLE user_category_frequencies (
    user_id VARCHAR(255),    -- Foreign Key referencing users.user_id
    category_id INT,       -- Foreign Key referencing categories.category_id
    frequency INT UNSIGNED DEFAULT 0 NOT NULL, -- Cached count of likes in this category
    PRIMARY KEY (user_id, category_id), -- Unique entry for each user/category pair
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);