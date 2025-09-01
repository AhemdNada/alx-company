DROP DATABASE IF EXISTS `apc`;

CREATE DATABASE IF NOT EXISTS `apc` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `apc`;

-- Clean reset (tables)
DROP TABLE IF EXISTS `project_details`;
DROP TABLE IF EXISTS `project_images`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `news_ticker`;
DROP TABLE IF EXISTS `news_images`;
DROP TABLE IF EXISTS `news`;
DROP TABLE IF EXISTS `chairmen`;
DROP TABLE IF EXISTS `sharing_rates`;
DROP TABLE IF EXISTS `contacts`;

-- Sharing Rates
CREATE TABLE `sharing_rates` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `percentage` DECIMAL(5,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `pk_sharing_rates` PRIMARY KEY (`id`),
  CONSTRAINT `chk_sharing_percentage` CHECK (`percentage` >= 0 AND `percentage` <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chairmen
CREATE TABLE `chairmen` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `image_url` TEXT,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `featured_one` TINYINT(1)
      GENERATED ALWAYS AS (CASE WHEN `is_featured` = 1 THEN 1 ELSE NULL END) STORED,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `pk_chairmen` PRIMARY KEY (`id`),
  UNIQUE KEY `u_one_featured` (`featured_one`),
  KEY `idx_chairmen_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- News
CREATE TABLE `news` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `subtitle` VARCHAR(255) DEFAULT NULL,
  `description` JSON NULL,
  `image_orientation` ENUM('vertical','horizontal') NOT NULL DEFAULT 'horizontal',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `pk_news` PRIMARY KEY (`id`),
  KEY `idx_news_created_at` (`created_at`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `news_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `news_id` INT NOT NULL,
  `image_url` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_news_images` PRIMARY KEY (`id`),
  KEY `idx_news_images_news_id` (`news_id`),
  CONSTRAINT `fk_news_images_news` FOREIGN KEY (`news_id`) REFERENCES `news` (`id`) ON DELETE CASCADE
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News Ticker (independent from news)
CREATE TABLE `news_ticker` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `message` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_news_ticker` PRIMARY KEY (`id`),
  KEY `idx_news_ticker_created_at` (`created_at`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contacts
CREATE TABLE `contacts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `is_replied` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `pk_contacts` PRIMARY KEY (`id`),
  KEY `idx_contacts_created_at` (`created_at`),
  KEY `idx_contacts_email` (`email`),
  KEY `idx_contacts_is_replied` (`is_replied`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects
CREATE TABLE `projects` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` JSON NULL,
  `category` ENUM('major_projects', 'replacement_renovation', 'geographical_region') NOT NULL DEFAULT 'major_projects',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `pk_projects` PRIMARY KEY (`id`),
  KEY `idx_projects_created_at` (`created_at`),
  KEY `idx_projects_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_images` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `image_url` TEXT NOT NULL,
  `is_cover` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_project_images` PRIMARY KEY (`id`),
  KEY `idx_project_images_project_id` (`project_id`),
  CONSTRAINT `fk_project_images_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `project_id` INT NOT NULL,
  `detail_key` VARCHAR(100) NOT NULL,
  `detail_value` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `pk_project_details` PRIMARY KEY (`id`),
  KEY `idx_project_details_project_id` (`project_id`),
  CONSTRAINT `fk_project_details_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SELECT * FROM sharing_rates;
SELECT * FROM chairmen;
SELECT * FROM news;
SELECT * FROM news_images;
SELECT * FROM news_ticker;
SELECT * FROM contacts;
SELECT * FROM projects;
SELECT * FROM project_images;
SELECT * FROM project_details;
