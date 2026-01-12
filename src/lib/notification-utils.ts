import { Asset, DatabaseSchema, NotificationSettings } from "./db";
import { extractAssetItems } from "./date-utils";
import { sendBarkNotification, sendTelegramNotification } from "./notification";

/**
 * 通知项接口
 */
export interface NotificationItem {
  assetId: number;
  assetName: string;
  itemName: string | null; // 具体项目名称（如域名），如果为null则是整个资产
  expiryDate: string;
}

/**
 * 获取资产的所有需要通知的项目
 * 如果资产有 expiryDate，返回整个资产
 * 如果资产没有 expiryDate，从 values 中提取所有项目
 */
export function getNotificationItems(asset: Asset): NotificationItem[] {
  const items: NotificationItem[] = [];

  // 如果有 expiryDate，作为整个资产通知
  if (asset.expiryDate) {
    items.push({
      assetId: asset.id,
      assetName: asset.name,
      itemName: null,
      expiryDate: asset.expiryDate
    });
    return items;
  }

  // 从 values 中提取所有项目
  const assetItems = extractAssetItems(asset.values);
  assetItems.forEach(item => {
    items.push({
      assetId: asset.id,
      assetName: asset.name,
      itemName: item.name,
      expiryDate: item.expiryDate
    });
  });

  return items;
}

/**
 * 处理通知逻辑
 */
export async function processNotifications(db: DatabaseSchema): Promise<{
  notifications: any[];
  settings: NotificationSettings;
}> {
  const settings = db.notificationSettings;
  if (!settings || !settings.enabled) {
    return { notifications: [], settings: settings! };
  }

  // 使用北京时间 (UTC+8)
  const now = new Date();
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  const today = beijingTime.toISOString().split("T")[0]; // YYYY-MM-DD

  const notifications: any[] = [];
  const assetsToNotify = db.assets.filter((asset: Asset) => asset.expiryNotify);

  for (const asset of assetsToNotify) {
    // 获取资产的所有通知项
    const notificationItems = getNotificationItems(asset);

    if (notificationItems.length === 0) continue;

    // 为每个项目单独检查和发送通知
    for (const item of notificationItems) {
      const expiryDate = new Date(item.expiryDate);
      const diffTime = expiryDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 检查是否需要通知
      const shouldNotify = daysRemaining <= settings.daysBeforeExpiry;

      // 生成唯一的通知键
      const notificationKey = item.itemName
        ? `${asset.id}_${item.itemName}`
        : `${asset.id}`;

      if (!shouldNotify) {
        // 如果不需要通知了，清除该项的通知记录
        if (settings.notifiedAssets[notificationKey]) {
          delete settings.notifiedAssets[notificationKey];
        }
        continue;
      }

      // 检查今天是否已经通知过
      const lastNotification = settings.notifiedAssets[notificationKey];
      if (lastNotification && lastNotification.lastNotifiedDate === today) {
        continue; // 今天已经通知过了
      }

      // 准备通知消息
      let statusText = "";
      if (daysRemaining > 0) {
        statusText = `还有 ${daysRemaining} 天到期`;
      } else if (daysRemaining === 0) {
        statusText = "今天到期";
      } else {
        statusText = `已过期 ${Math.abs(daysRemaining)} 天`;
      }

      // 构建消息内容
      const displayName = item.itemName
        ? `${asset.name} - ${item.itemName}`
        : asset.name;

      const message = {
        title: "资产到期提醒",
        body: `资产「${displayName}」${statusText}\n到期日期: ${item.expiryDate}`,
        assetId: asset.id,
        daysRemaining
      };

      // 发送通知
      const results = {
        bark: false,
        telegram: false
      };

      if (settings.channels.bark.enabled) {
        results.bark = await sendBarkNotification(settings.channels.bark, message);
      }

      if (settings.channels.telegram.enabled) {
        results.telegram = await sendTelegramNotification(settings.channels.telegram, message);
      }

      // 记录通知
      settings.notifiedAssets[notificationKey] = {
        lastNotifiedDate: today,
        daysRemaining
      };

      notifications.push({
        assetId: asset.id,
        assetName: displayName,
        daysRemaining,
        results
      });
    }
  }

  if (notifications.length > 0) {
    settings.lastNotificationCheck = now.getTime();
  }

  return { notifications, settings };
}
