-- 艺术品预订网站数据库初始化脚本
-- Database: artwork_booking

-- 创建数据库
CREATE DATABASE IF NOT EXISTS artwork_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE artwork_booking;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `role` enum('user','artist','admin') NOT NULL DEFAULT 'user',
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_users_email` (`email`),
  KEY `IDX_users_role` (`role`),
  KEY `IDX_users_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 艺术家表
CREATE TABLE IF NOT EXISTS `artists` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `bio` text,
  `specialization` varchar(255) DEFAULT NULL,
  `yearsOfExperience` int DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `socialMedia` json DEFAULT NULL,
  `isFeatured` boolean NOT NULL DEFAULT false,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_artists_userId` (`userId`),
  KEY `IDX_artists_isActive` (`isActive`),
  KEY `IDX_artists_isFeatured` (`isFeatured`),
  CONSTRAINT `FK_artists_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `imageUrl` varchar(500) DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_categories_slug` (`slug`),
  KEY `IDX_categories_isActive` (`isActive`),
  KEY `IDX_categories_sortOrder` (`sortOrder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 艺术品表
CREATE TABLE IF NOT EXISTS `artworks` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `medium` varchar(100) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `artistId` varchar(36) NOT NULL,
  `categoryId` varchar(36) NOT NULL,
  `images` json NOT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `isAvailable` boolean NOT NULL DEFAULT true,
  `isFeatured` boolean NOT NULL DEFAULT false,
  `isActive` boolean NOT NULL DEFAULT true,
  `viewCount` int NOT NULL DEFAULT 0,
  `averageRating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `totalReviews` int NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_artworks_slug` (`slug`),
  KEY `IDX_artworks_artistId` (`artistId`),
  KEY `IDX_artworks_categoryId` (`categoryId`),
  KEY `IDX_artworks_price` (`price`),
  KEY `IDX_artworks_isAvailable` (`isAvailable`),
  KEY `IDX_artworks_isFeatured` (`isFeatured`),
  KEY `IDX_artworks_isActive` (`isActive`),
  KEY `IDX_artworks_averageRating` (`averageRating`),
  CONSTRAINT `FK_artworks_artistId` FOREIGN KEY (`artistId`) REFERENCES `artists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_artworks_categoryId` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` varchar(36) NOT NULL,
  `orderNumber` varchar(50) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `paymentMethod` varchar(50) DEFAULT NULL,
  `transactionId` varchar(100) DEFAULT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_orders_orderNumber` (`orderNumber`),
  KEY `IDX_orders_userId` (`userId`),
  KEY `IDX_orders_status` (`status`),
  KEY `IDX_orders_paymentStatus` (`paymentStatus`),
  KEY `IDX_orders_createdAt` (`createdAt`),
  CONSTRAINT `FK_orders_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 订单项表
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` varchar(36) NOT NULL,
  `orderId` varchar(36) NOT NULL,
  `artworkId` varchar(36) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  `subtotal` decimal(10,2) NOT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_order_items_orderId` (`orderId`),
  KEY `IDX_order_items_artworkId` (`artworkId`),
  CONSTRAINT `FK_order_items_orderId` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_order_items_artworkId` FOREIGN KEY (`artworkId`) REFERENCES `artworks` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收藏表
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` varchar(36) NOT NULL,
  `userId` varchar(36) NOT NULL,
  `artworkId` varchar(36) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_favorites_userId_artworkId` (`userId`,`artworkId`),
  KEY `IDX_favorites_userId` (`userId`),
  KEY `IDX_favorites_artworkId` (`artworkId`),
  CONSTRAINT `FK_favorites_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_favorites_artworkId` FOREIGN KEY (`artworkId`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评价表
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` varchar(36) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `userId` varchar(36) NOT NULL,
  `artworkId` varchar(36) NOT NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `IDX_reviews_userId` (`userId`),
  KEY `IDX_reviews_artworkId` (`artworkId`),
  KEY `IDX_reviews_rating` (`rating`),
  KEY `IDX_reviews_isActive` (`isActive`),
  CONSTRAINT `FK_reviews_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_reviews_artworkId` FOREIGN KEY (`artworkId`) REFERENCES `artworks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认数据

-- 插入默认用户（管理员）
INSERT IGNORE INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `role`, `isActive`) VALUES
('admin-uuid-123456789', 'admin@artbooking.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin', true);

-- 插入默认分类
INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `description`, `sortOrder`, `isActive`) VALUES
('cat-painting-001', '绘画', 'painting', '各种绘画作品，包括油画、水彩画、丙烯画等', 1, true),
('cat-sculpture-002', '雕塑', 'sculpture', '立体艺术作品，包括石雕、木雕、金属雕塑等', 2, true),
('cat-photography-003', '摄影', 'photography', '摄影作品，包括风景、人像、纪实摄影等', 3, true),
('cat-digital-004', '数字艺术', 'digital-art', '数字创作的艺术作品，包括数字绘画、3D建模等', 4, true),
('cat-mixed-media-005', '混合媒体', 'mixed-media', '结合多种媒介和技术的艺术作品', 5, true);

-- 创建索引优化查询
CREATE INDEX `IDX_artworks_title` ON `artworks` (`title`);
CREATE INDEX `IDX_artworks_year` ON `artworks` (`year`);
CREATE INDEX `IDX_orders_totalAmount` ON `orders` (`totalAmount`);
CREATE INDEX `IDX_reviews_createdAt` ON `reviews` (`createdAt`);
CREATE INDEX `IDX_favorites_createdAt` ON `favorites` (`createdAt`);

-- 创建全文搜索索引（仅针对稳定字段，避免因列名差异导致初始化失败）
ALTER TABLE `artworks` ADD FULLTEXT(`title`, `description`);