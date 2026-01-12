"use server";

import { readDb, writeDb, NotificationSettings } from "@/lib/db";

export async function getNotificationSettings() {
  const db = await readDb();

  // 如果没有通知设置，返回默认值
  if (!db.notificationSettings) {
    db.notificationSettings = {
      enabled: false,
      daysBeforeExpiry: 7,
      notificationTime: "09:00",
      channels: {
        bark: {
          enabled: false,
          serverUrl: "",
          deviceKey: "",
        },
        telegram: {
          enabled: false,
          botToken: "",
          chatId: "",
        },
      },
      lastNotificationCheck: 0,
      notifiedAssets: {},
    };
    await writeDb(db);
  }

  return { success: true, data: db.notificationSettings };
}

export async function updateNotificationSettings(settings: NotificationSettings) {
  try {
    const db = await readDb();
    db.notificationSettings = settings;
    await writeDb(db);
    return { success: true, message: "通知设置已保存" };
  } catch (error) {
    console.error("Failed to update notification settings:", error);
    return { success: false, message: "保存失败" };
  }
}
