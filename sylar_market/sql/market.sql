-- ═══════════════════════════════════════════════════════════════════
-- MARKET SYSTEM DATABASE SCHEMA
-- ═══════════════════════════════════════════════════════════════════

-- Market Ownership Table
CREATE TABLE IF NOT EXISTS `market_ownership` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `market_id` VARCHAR(50) NOT NULL UNIQUE,
    `owner_id` VARCHAR(100) DEFAULT NULL,
    `owner_name` VARCHAR(100) DEFAULT NULL,
    `purchased_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `purchase_price` INT DEFAULT 0,
    INDEX `idx_market_id` (`market_id`),
    INDEX `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Market Purchase Logs
CREATE TABLE IF NOT EXISTS `market_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `identifier` VARCHAR(100) NOT NULL,
    `market_id` VARCHAR(50) NOT NULL,
    `items` TEXT NOT NULL,
    `total` INT NOT NULL,
    `payment_method` VARCHAR(20) NOT NULL,
    `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_identifier` (`identifier`),
    INDEX `idx_market_id` (`market_id`),
    INDEX `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Market Points for ESX (QB uses metadata)
-- Add this column to your users table if using ESX:
-- ALTER TABLE `users` ADD COLUMN `marketpoints` INT DEFAULT 0;

-- Initial Market Ownership Data (Optional)
INSERT INTO `market_ownership` (`market_id`, `owner_id`, `owner_name`, `purchase_price`) VALUES
('market_1', NULL, NULL, 500000),
('market_2', NULL, NULL, 350000),
('market_3', NULL, NULL, 0)
ON DUPLICATE KEY UPDATE `market_id` = `market_id`;

-- ═══════════════════════════════════════════════════════════════════
-- STATISTICS VIEW (Optional)
-- ═══════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW `market_statistics` AS
SELECT 
    ml.market_id,
    mo.owner_name,
    COUNT(*) as total_transactions,
    SUM(ml.total) as total_revenue,
    AVG(ml.total) as avg_transaction,
    DATE(ml.timestamp) as sale_date
FROM `market_logs` ml
LEFT JOIN `market_ownership` mo ON ml.market_id = mo.market_id
GROUP BY ml.market_id, DATE(ml.timestamp)
ORDER BY ml.timestamp DESC;
