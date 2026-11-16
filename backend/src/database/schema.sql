CREATE DATABASE IF NOT EXISTS listflix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE listflix;

CREATE TABLE IF NOT EXISTS movies (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  owner_email VARCHAR(255) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  poster_url  VARCHAR(1000) NOT NULL,
  imdb_id     VARCHAR(20) NULL,
  year        SMALLINT UNSIGNED NULL,
  genre       VARCHAR(50) NULL,
  overview    TEXT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_movies_owner_id (owner_email, id),
  INDEX idx_movies_owner_title (owner_email, title)
);
