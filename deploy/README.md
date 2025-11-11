部署指南（阿里云 ECS / Linux 服务器）

本项目提供一键部署脚本与配置模板，支持：
- 服务器初始化（Node.js、PM2、Nginx、Certbot）
- 后端部署与进程守护（PM2）
- 前端构建与部署（Nginx 静态站点）
- Nginx 反向代理 `/api` 到后端 `3000`
- 可选 SSL 自动签发（Let’s Encrypt）
- 数据库初始化（创建库）

使用步骤：
1. 复制并填写环境变量文件：
   - 将 `deploy/.env.deploy.example` 复制为 `deploy/.env.deploy`
   - 将 `deploy/.env.server.example` 复制为 `deploy/.env.server`
2. 本地构建前端：在仓库根目录执行 `npm ci && npm run build`
3. 一键部署（本地执行）：在项目根目录运行 `bash deploy/deploy_all.sh`
4. 首次上线后（可选）签发 SSL：确保域名解析正确后运行 `bash deploy/setup_ssl.sh`

注意事项：
- 阿里云需在安全组开放 80/443（HTTP/HTTPS）端口
- 后端 `.env` 中 `FRONTEND_URL` 应为生产域名（如 `https://your-domain.com`）
- 脚本默认支持 Ubuntu（apt）与 CentOS（yum）
- 更新代码后重复执行 `deploy_all.sh` 即可滚动更新