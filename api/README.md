# Artwork Booking System API

## 项目介绍
这是一个艺术品预订系统的后端API，基于Node.js + Express + TypeScript + MySQL开发。

## 功能特性
- 艺术品管理
- 艺术家管理
- 用户认证与授权
- 订单管理
- 图片上传
- 响应式API设计

## 技术栈
- **Node.js** - 运行环境
- **Express.js** - Web框架
- **TypeScript** - 编程语言
- **MySQL** - 数据库
- **TypeORM** - ORM框架
- **JWT** - 身份认证
- **Multer** - 文件上传

## 安装和运行

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 生产环境构建和运行
```bash
npm run build
npm start
```

## 环境配置
创建 `.env` 文件，配置以下参数：
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=artwork_booking
JWT_SECRET=your-secret-key
PORT=3000
```

## API文档
启动服务后访问 `http://localhost:3000/api-docs` 查看Swagger文档。