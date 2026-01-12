# 到期通知功能使用说明

## 功能概述

系统已添加完整的资产到期通知功能,支持:
- ✅ 启用/禁用通知开关
- ✅ 自定义提前通知天数
- ✅ 精确到分钟的通知时间设置
- ✅ 每天重复通知(从到期前N天开始,直到到期后)
- ✅ Bark 推送通知(iOS)
- ✅ Telegram 机器人通知
- ✅ 支持同时启用多个通知渠道
- ✅ **自动后台监控** - 服务器启动后自动运行,无需外部定时任务

## 配置步骤

### 1. 进入系统设置

访问 `/dashboard/settings` 页面,找到"到期通知设置"卡片。

### 2. 基础配置

- **启用到期通知**: 打开开关启用通知功能
- **提前通知天数**: 设置在资产到期前多少天开始通知(例如: 7天)
- **每日通知时间**: 设置每天检查通知的时间(例如: 09:00)

### 3. 配置 Bark 通知(可选)

如果你使用 iOS 设备,可以配置 Bark 推送:

1. 在 App Store 下载 Bark 应用
2. 打开 Bark,获取你的设备密钥
3. 在设置中填写:
   - **Bark 服务器地址**: `https://api.day.app` (默认)
   - **设备密钥**: 你的 Bark 设备密钥

### 4. 配置 Telegram 通知(可选)

如果你使用 Telegram,可以配置机器人通知:

1. 在 Telegram 中找到 @BotFather,创建一个新机器人
2. 获取 Bot Token
3. 获取你的 Chat ID (可以通过 @userinfobot 获取)
4. 在设置中填写:
   - **Bot Token**: 你的机器人 Token
   - **Chat ID**: 你的聊天 ID

### 5. 测试通知

配置完成后,点击"测试通知"按钮,验证配置是否正确。

### 6. 保存设置

点击"保存通知设置"按钮保存配置。

### 7. 重启服务器

保存设置后,重启 Next.js 服务器以启动后台通知调度器:

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
# 或生产环境
npm run build && npm start
```

服务器启动后,你会在控制台看到:
```
Database initialized successfully
[Notification Scheduler] Starting background scheduler...
[Notification Scheduler] Background scheduler started
```

## 自动后台监控

系统已内置自动后台监控功能,**无需配置外部定时任务**。

### 工作原理

- 服务器启动时自动启动后台调度器
- 每分钟自动检查一次通知条件
- 在设置的通知时间(±5分钟)内自动发送通知
- 只要服务器在运行,就会持续监控

### 监控日志

你可以在服务器控制台看到监控日志:
```
[Notification Scheduler] Checking notifications at 9:00
[Notification Scheduler] Sent notification for asset: 伍六七云
[Notification Scheduler] Sent 2 notifications
```

## 可选: 外部定时任务(备用方案)

如果你需要额外的可靠性保障,可以配置外部定时任务作为备用。有以下几种方式:

### 方式一: 使用在线 Cron 服务(推荐)

使用免费的在线 Cron 服务,如:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- [cron-job.io](https://cron-job.io)

配置步骤:
1. 注册账号
2. 创建新的 Cron Job
3. 设置 URL: `https://你的域名/api/cron`
4. 设置执行频率: 每分钟执行一次 (`* * * * *`)
5. 保存并启用

### 方式二: 使用服务器 Crontab

如果你有自己的服务器,可以使用 crontab:

```bash
# 编辑 crontab
crontab -e

# 添加以下行(每分钟执行一次)
* * * * * curl -X GET http://localhost:3000/api/cron
```

### 方式三: 使用 Vercel Cron Jobs

如果部署在 Vercel,可以使用 Vercel Cron Jobs:

1. 在项目根目录创建 `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "* * * * *"
  }]
}
```

2. 重新部署项目

## 通知逻辑说明

### 通知触发条件

- 资产必须设置了到期日期
- 资产必须启用了到期通知
- 当前日期在"到期日期 - 提前通知天数"范围内
- 当前时间在设置的通知时间±5分钟内

### 重复通知机制

例如,设置提前7天通知:
- 第7天(到期前7天): ✅ 发送通知
- 第6天(到期前6天): ✅ 发送通知
- 第5天(到期前5天): ✅ 发送通知
- ...
- 第1天(到期前1天): ✅ 发送通知
- 到期当天: ✅ 发送通知
- 到期后: ✅ 继续发送通知(显示已过期X天)

### 通知内容

通知消息包含:
- 资产名称
- 到期状态(还有X天到期/今天到期/已过期X天)
- 到期日期

## API 端点

系统提供以下 API 端点:

- `POST /api/notifications/check` - 检查并发送通知
- `POST /api/notifications/test` - 发送测试通知
- `GET /api/cron` - Cron 任务端点

## 安全建议

为了增加安全性,可以设置环境变量 `CRON_SECRET`:

```env
CRON_SECRET=your_secret_key_here
```

然后在调用 Cron 端点时添加 Authorization 头:

```bash
curl -X GET https://你的域名/api/cron \
  -H "Authorization: Bearer your_secret_key_here"
```

## 故障排查

### 通知没有发送

1. 检查通知是否已启用
2. 检查资产是否设置了到期日期和启用了通知
3. 检查当前时间是否在设置的通知时间范围内
4. 检查定时任务是否正常运行
5. 查看服务器日志

### Bark 通知失败

1. 检查服务器地址是否正确
2. 检查设备密钥是否正确
3. 检查网络连接

### Telegram 通知失败

1. 检查 Bot Token 是否正确
2. 检查 Chat ID 是否正确
3. 确保机器人已经和你的账号建立对话
4. 检查网络连接

## 数据库结构

通知设置存储在 `data/db.json` 的 `notificationSettings` 字段中:

```json
{
  "notificationSettings": {
    "enabled": true,
    "daysBeforeExpiry": 7,
    "notificationTime": "09:00",
    "channels": {
      "bark": {
        "enabled": true,
        "serverUrl": "https://api.day.app",
        "deviceKey": "your_key"
      },
      "telegram": {
        "enabled": true,
        "botToken": "your_token",
        "chatId": "your_chat_id"
      }
    },
    "lastNotificationCheck": 1234567890,
    "notifiedAssets": {
      "1": {
        "lastNotifiedDate": "2026-01-11",
        "daysRemaining": 7
      }
    }
  }
}
```
