# 网络资产管理系统 (Network Asset Manager)

这是一个基于 Next.js 15+ 开发的轻量级网络资产管理系统，旨在帮助用户高效管理服务器、域名、账号等各类网络资产。系统支持自定义分组、资产到期提醒，并内置了多种通知渠道。

## ✨ 功能特性

- **资产管理**：支持主分组与子分组二级分类，灵活组织资产。
- **到期提醒**：支持设置资产到期日期，并提供自动提醒功能。
- **多渠道通知**：
  - ✅ **Bark 推送** (iOS)
  - ✅ **Telegram 机器人**
- **自动后台监控**：内置调度器，服务器启动后自动运行，无需复杂的外部 Cron 配置。
- **响应式设计**：基于 Tailwind CSS 和 Shadcn UI，支持移动端访问。
- **轻量存储**：使用本地 JSON 文件存储数据，无需配置复杂的数据库服务器。

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone <your-repo-url>
   cd network-asset-manager
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问系统**
   打开浏览器访问 `http://localhost:3000`。
   - **默认账号**：`admin`
   - **默认密码**：`admin`

## 🛠️ 部署教程

### 常规服务器部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **启动生产环境**
   ```bash
   npm start
   ```
   建议使用 `pm2` 等进程管理工具运行，以保证服务稳定。

### Docker 部署 (推荐)

你可以编写一个简单的 `Dockerfile` 进行部署，或者直接在支持 Node.js 的容器环境中运行。

### Vercel 部署

由于本项目使用本地文件系统 (`data/db.json`) 存储数据，**不建议**直接部署在 Vercel 等只读文件系统的平台上。建议部署在拥有持久化存储的 VPS 或服务器上。

## 🔔 到期通知配置

详细的通知配置请参考 [NOTIFICATION_GUIDE.md](./NOTIFICATION_GUIDE.md)。

### 简要步骤：
1. 进入 **系统设置** (`/dashboard/settings`)。
2. 开启 **启用到期通知** 开关。
3. 配置 **Bark** 或 **Telegram** 参数。
4. 点击 **测试通知** 确保配置正确。
5. **重启服务器** 以激活后台调度器。

## 📂 项目结构

- `src/app`: Next.js App Router 页面与路由。
- `src/components`: UI 组件。
- `src/lib`: 核心逻辑、数据库操作及通知调度器。
- `data/`: 数据存储目录（包含 `db.json` 和图标文件）。

## 📝 开源协议

[MIT License](LICENSE)