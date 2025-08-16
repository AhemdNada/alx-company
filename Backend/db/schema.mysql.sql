DROP DATABASE IF EXISTS `apc`;

CREATE DATABASE IF NOT EXISTS `apc` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `apc`;

-- Clean reset (tables)
DROP TABLE IF EXISTS `chairmen`;
DROP TABLE IF EXISTS `sharing_rates`;

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


SELECT * FROM sharing_rates;
SELECT * FROM chairmen;
