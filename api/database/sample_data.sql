-- 插入示例数据脚本
USE artwork_booking;

-- 插入示例用户
INSERT INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `phone`, `role`, `isActive`) VALUES
('user-001-uuid', 'zhang@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '张', '艺术', '13800138000', 'artist', true),
('user-002-uuid', 'li@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '李', '画家', '13900139000', 'artist', true),
('user-003-uuid', 'wang@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '王', '收藏', '13700137000', 'user', true),
('user-004-uuid', 'chen@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '陈', '艺术', '13600136000', 'user', true),
('admin-001-uuid', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统', '管理员', '13500135000', 'admin', true);

-- 插入示例艺术家信息
INSERT INTO `artists` (`id`, `userId`, `bio`, `specialization`, `yearsOfExperience`, `website`, `isFeatured`, `isActive`) VALUES
('artist-001-uuid', 'user-001-uuid', '专注于现代抽象绘画，作品风格独特，深受收藏者喜爱。', '抽象绘画', 15, 'https://zhang-art.com', true, true),
('artist-002-uuid', 'user-002-uuid', '擅长风景油画，作品色彩丰富，表现力强。', '风景油画', 20, 'https://li-painting.com', false, true);

-- 插入示例艺术品
INSERT INTO `artworks` (`id`, `title`, `slug`, `description`, `price`, `dimensions`, `medium`, `year`, `artistId`, `categoryId`, `images`, `thumbnail`, `isAvailable`, `isFeatured`, `isActive`, `viewCount`, `averageRating`, `totalReviews`) VALUES
('artwork-001-uuid', '抽象之美', 'abstract-beauty', '这是一幅充满现代感的抽象画作，色彩丰富，层次分明。', 5800.00, '80x60cm', '丙烯颜料', 2023, 'artist-001-uuid', 'cat-painting-001', '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20abstract%20painting%20with%20vibrant%20colors%20and%20dynamic%20composition&image_size=square_hd"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20abstract%20painting%20with%20vibrant%20colors%20and%20dynamic%20composition&image_size=square', true, true, true, 156, 4.80, 12),

('artwork-002-uuid', '山水情怀', 'landscape-emotion', '传统山水画风格，展现自然之美，意境深远。', 7200.00, '100x70cm', '水墨画', 2022, 'artist-002-uuid', 'cat-painting-001', '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20landscape%20painting%20with%20mountains%20and%20rivers%20in%20ink%20wash%20style&image_size=landscape_4_3"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20landscape%20painting%20with%20mountains%20and%20rivers%20in%20ink%20wash%20style&image_size=square', true, false, true, 89, 4.60, 8),

('artwork-003-uuid', '城市印象', 'city-impression', '现代都市风光，展现城市的繁华与活力。', 4500.00, '60x80cm', '油画', 2023, 'artist-001-uuid', 'cat-painting-001', '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cityscape%20painting%20with%20skyscrapers%20and%20urban%20atmosphere%20in%20oil%20painting%20style&image_size=landscape_16_9"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20cityscape%20painting%20with%20skyscrapers%20and%20urban%20atmosphere%20in%20oil%20painting%20style&image_size=square', true, true, true, 134, 4.70, 10),

('artwork-004-uuid', '静物之美', 'still-life-beauty', '精美的静物画作，展现日常生活的美好。', 3200.00, '50x60cm', '水彩画', 2023, 'artist-002-uuid', 'cat-painting-001', '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20still%20life%20watercolor%20painting%20with%20flowers%20and%20fruits%20in%20soft%20colors&image_size=portrait_4_3"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20still%20life%20watercolor%20painting%20with%20flowers%20and%20fruits%20in%20soft%20colors&image_size=square', true, false, true, 67, 4.50, 6),

('artwork-005-uuid', '雕塑作品-和谐', 'sculpture-harmony', '现代雕塑作品，体现和谐与平衡之美。', 12000.00, '40x30x25cm', '大理石', 2022, 'artist-001-uuid', 'cat-sculpture-002', '["https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20marble%20sculpture%20with%20harmonious%20and%20balanced%20design%20in%20minimalist%20style&image_size=portrait_4_3"]', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20marble%20sculpture%20with%20harmonious%20and%20balanced%20design%20in%20minimalist%20style&image_size=square', true, true, true, 98, 4.90, 15);

-- 插入示例订单
INSERT INTO `orders` (`id`, `orderNumber`, `userId`, `totalAmount`, `status`, `paymentStatus`, `paymentMethod`, `notes`) VALUES
('order-001-uuid', 'ORD-2023-001', 'user-003-uuid', 5800.00, 'delivered', 'paid', 'credit_card', '请小心包装，谢谢！'),
('order-002-uuid', 'ORD-2023-002', 'user-004-uuid', 7200.00, 'shipped', 'paid', 'alipay', '期待收到这幅美丽的山水画。');

-- 插入示例订单项
INSERT INTO `order_items` (`id`, `orderId`, `artworkId`, `price`, `quantity`, `subtotal`) VALUES
('orderitem-001-uuid', 'order-001-uuid', 'artwork-001-uuid', 5800.00, 1, 5800.00),
('orderitem-002-uuid', 'order-002-uuid', 'artwork-002-uuid', 7200.00, 1, 7200.00);

-- 插入示例收藏
INSERT INTO `favorites` (`id`, `userId`, `artworkId`) VALUES
('fav-001-uuid', 'user-003-uuid', 'artwork-003-uuid'),
('fav-002-uuid', 'user-003-uuid', 'artwork-005-uuid'),
('fav-003-uuid', 'user-004-uuid', 'artwork-001-uuid');

-- 插入示例评价
INSERT INTO `reviews` (`id`, `rating`, `comment`, `userId`, `artworkId`, `isActive`) VALUES
('review-001-uuid', 5, '非常棒的抽象画作，色彩丰富，很有艺术感！', 'user-003-uuid', 'artwork-001-uuid', true),
('review-002-uuid', 4, '山水画很有意境，技法娴熟。', 'user-004-uuid', 'artwork-002-uuid', true),
('review-003-uuid', 5, '现代感十足，很喜欢这种风格。', 'user-003-uuid', 'artwork-003-uuid', true),
('review-004-uuid', 4, '水彩画技法很好，色彩搭配和谐。', 'user-004-uuid', 'artwork-004-uuid', true),
('review-005-uuid', 5, '雕塑作品非常精美，工艺精湛。', 'user-003-uuid', 'artwork-005-uuid', true);

-- 兼容当前实体所需的字段修复（确保页面能加载内容）
-- 1) 为艺术家添加必需的name字段并设置为active
UPDATE `artists` SET `name`='张艺术', `status`='active' WHERE `id`='artist-001-uuid';
UPDATE `artists` SET `name`='李画家', `status`='active' WHERE `id`='artist-002-uuid';

-- 1.1) 为用户补齐 name/status，并把 admin 账号设为 active
UPDATE `users` SET `name`='系统管理员', `isActive`=TRUE WHERE `id`='admin-001-uuid';

-- 2) 为艺术品补齐必需的imageUrl字段（取images数组首图）
-- 注：如果数据库不支持JSON_EXTRACT，请将下面更新语句替换为直接赋值的URL
UPDATE `artworks` 
SET `imageUrl`=JSON_UNQUOTE(JSON_EXTRACT(`images`, '$[0]'))
WHERE (`imageUrl` IS NULL OR `imageUrl`='');

-- 3) 确保分类存在且活跃（避免首页分类为空）
-- 使用INSERT IGNORE避免重复插入错误（MySQL）
INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `isActive`) VALUES 
('cat-painting-001', '绘画', 'painting', TRUE),
('cat-sculpture-002', '雕塑', 'sculpture', TRUE);

-- 4) 为分类设置示例图片，确保首页分类卡片显示
UPDATE `categories` SET `imageUrl`='https://picsum.photos/seed/painting/800/800' WHERE `id`='cat-painting-001';
UPDATE `categories` SET `imageUrl`='https://picsum.photos/seed/sculpture/800/800' WHERE `id`='cat-sculpture-002';
UPDATE `categories` SET `imageUrl`='https://picsum.photos/seed/photography/800/800' WHERE `id`='cat-photography-003';
UPDATE `categories` SET `imageUrl`='https://picsum.photos/seed/digital/800/800' WHERE `id`='cat-digital-004';
UPDATE `categories` SET `imageUrl`='https://picsum.photos/seed/mixed-media/800/800' WHERE `id`='cat-mixed-media-005';

-- 5) 为 artworks 补齐缺失的分类与艺术家关联，避免页面展示空关联
-- 默认将缺失的分类设置为“绘画”，艺术家设置为 artist-001
UPDATE `artworks`
SET `categoryId`='cat-painting-001'
WHERE (`categoryId` IS NULL OR `categoryId`='');

UPDATE `artworks`
SET `artistId`='artist-001-uuid'
WHERE (`artistId` IS NULL OR `artistId`='');