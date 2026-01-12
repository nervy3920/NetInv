import { readDb, writeDb } from "./db";
import { processNotifications } from "./notification-utils";

let schedulerInterval: NodeJS.Timeout | null = null;
let isChecking = false;

/**
 * 检查并发送通知
 */
async function checkAndSendNotifications() {
  if (isChecking) {
    console.log("[Notification Scheduler] Already checking, skipping...");
    return;
  }

  isChecking = true;

  try {
    const db = await readDb();

    // 检查是否启用通知
    if (!db.notificationSettings || !db.notificationSettings.enabled) {
      isChecking = false;
      return;
    }

    const settings = db.notificationSettings;

    // 使用北京时间 (UTC+8)
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));

    // 检查是否需要在当前时间发送通知
    const [targetHour, targetMinute] = settings.notificationTime.split(":").map(Number);
    const currentHour = beijingTime.getUTCHours();
    const currentMinute = beijingTime.getUTCMinutes();

    // 允许5分钟的误差范围
    const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (targetHour * 60 + targetMinute));

    if (timeDiff > 5) {
      isChecking = false;
      return;
    }

    console.log(`[Notification Scheduler] Checking notifications at ${currentHour}:${currentMinute}`);

    const { notifications, settings: updatedSettings } = await processNotifications(db);

    if (notifications.length > 0) {
      // 更新数据库
      db.notificationSettings = updatedSettings;
      await writeDb(db);
      console.log(`[Notification Scheduler] Sent ${notifications.length} notifications`);
    }
  } catch (error) {
    console.error("[Notification Scheduler] Error:", error);
  } finally {
    isChecking = false;
  }
}

/**
 * 启动通知调度器
 */
export function startNotificationScheduler() {
  if (schedulerInterval) {
    console.log("[Notification Scheduler] Already running");
    return;
  }

  console.log("[Notification Scheduler] Starting background scheduler...");

  // 每分钟检查一次
  schedulerInterval = setInterval(() => {
    checkAndSendNotifications();
  }, 60 * 1000); // 60秒

  // 立即执行一次检查
  checkAndSendNotifications();

  console.log("[Notification Scheduler] Background scheduler started");
}

/**
 * 停止通知调度器
 */
export function stopNotificationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[Notification Scheduler] Stopped");
  }
}
