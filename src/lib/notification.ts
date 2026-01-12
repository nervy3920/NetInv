import { NotificationSettings, Asset } from "./db";

export interface NotificationMessage {
  title: string;
  body: string;
  assetId: number;
  daysRemaining: number;
}

/**
 * 发送 Bark 通知
 */
export async function sendBarkNotification(
  settings: NotificationSettings["channels"]["bark"],
  message: NotificationMessage
): Promise<boolean> {
  if (!settings.enabled || !settings.serverUrl || !settings.deviceKey) {
    return false;
  }

  try {
    const url = `${settings.serverUrl.replace(/\/$/, "")}/${settings.deviceKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: message.title,
        body: message.body,
        group: "资产到期提醒",
        sound: "alarm",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Bark notification failed:", error);
    return false;
  }
}

/**
 * 发送 Telegram 通知
 */
export async function sendTelegramNotification(
  settings: NotificationSettings["channels"]["telegram"],
  message: NotificationMessage
): Promise<boolean> {
  if (!settings.enabled || !settings.botToken || !settings.chatId) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
    const text = `🔔 ${message.title}\n\n${message.body}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return false;
  }
}
