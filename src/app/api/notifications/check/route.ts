import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { getNotificationItems, processNotifications } from "@/lib/notification-utils";

export async function POST() {
  try {
    const db = await readDb();

    // 检查是否启用通知
    if (!db.notificationSettings || !db.notificationSettings.enabled) {
      return NextResponse.json({ success: false, message: "通知未启用" });
    }

    const settings = db.notificationSettings;

    // 使用北京时间 (UTC+8)
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    const today = beijingTime.toISOString().split("T")[0]; // YYYY-MM-DD

    // 检查是否需要在当前时间发送通知
    const [targetHour, targetMinute] = settings.notificationTime.split(":").map(Number);
    const currentHour = beijingTime.getUTCHours();
    const currentMinute = beijingTime.getUTCMinutes();

    // 允许5分钟的误差范围
    const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (targetHour * 60 + targetMinute));

    // 调试信息
    const debugInfo = {
      beijingTime: `${currentHour}:${String(currentMinute).padStart(2, '0')}`,
      targetTime: settings.notificationTime,
      timeDiff,
      isInTimeRange: timeDiff <= 5,
      assetsWithExpiry: db.assets.filter(a => a.expiryNotify && getNotificationItems(a).length > 0).length
    };

    if (timeDiff > 5) {
      return NextResponse.json({
        success: false,
        message: "当前不在通知时间范围内",
        debug: debugInfo
      });
    }

    const { notifications, settings: updatedSettings } = await processNotifications(db);

    // 更新数据库
    db.notificationSettings = updatedSettings;
    await writeDb(db);

    return NextResponse.json({
      success: true,
      message: `已发送 ${notifications.length} 条通知`,
      debug: debugInfo,
      notifications
    });
  } catch (error) {
    console.error("Notification check failed:", error);
    return NextResponse.json(
      { success: false, message: "通知检查失败" },
      { status: 500 }
    );
  }
}
