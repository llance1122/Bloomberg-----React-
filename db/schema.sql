-- Bloomberg 借用系統資料庫 schema
-- 在 Azure Database for MySQL Flexible Server 上建立資料庫後，連進去執行這份 SQL

CREATE DATABASE IF NOT EXISTS booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE booking;

CREATE TABLE IF NOT EXISTS classroom_booking (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(50)  NOT NULL,
  department    VARCHAR(50)  NOT NULL,
  student_id    VARCHAR(8)   NOT NULL,
  booking_date  DATE         NOT NULL,
  start_time    TIME         NOT NULL,
  end_time      TIME         NULL,
  status        ENUM('借用中', '已完成') NOT NULL DEFAULT '借用中',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status_date (status, booking_date),
  INDEX idx_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
