import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { sendBarkNotification, sendTelegramNotification } from "@/lib/notification";

export async function POST() {
  try {
    const db = await readDb();

    if (!db.notificationSettings || !db.notificationSettings.enabled) {
      return NextResponse.json({ success: false, message: "通知未启用" });
    }

    const settings = db.notificationSettings;
    const testMessage = {
      title: "测试通知",
      body: "这是一条测试通知，如果您收到此消息，说明通知配置正确。",
      assetId: 0,
      daysRemaining: 0
    };

    const results = {
      bark: { enabled: false, success: false },
      telegram: { enabled: false, success: false }
    };

    if (settings.channels.bark.enabled) {
      results.bark.enabled = true;
      results.bark.success = await sendBarkNotification(settings.channels.bark, testMessage);
    }

    if (settings.channels.telegram.enabled) {
      results.telegram.enabled = true;
      results.telegram.success = await sendTelegramNotification(settings.channels.telegram, testMessage);
    }

    return NextResponse.json({
      success: true,
      message: "测试通知已发送",
      results
    });
  } catch (error) {
    console.error("Test notification failed:", error);
    return NextResponse.json(
      { success: false, message: "测试通知失败" },
      { status: 500 }
    );
  }
}
