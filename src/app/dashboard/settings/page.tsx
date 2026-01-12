"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updatePasswordAction } from "@/app/login/actions";
import { getNotificationSettings, updateNotificationSettings } from "./actions";
import { NotificationSettings } from "@/lib/db";

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  // 通知设置状态
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMessage, setNotifMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    daysBeforeExpiry: 7,
    notificationTime: "09:00",
    channels: {
      bark: { enabled: false, serverUrl: "", deviceKey: "" },
      telegram: { enabled: false, botToken: "", chatId: "" },
    },
    lastNotificationCheck: 0,
    notifiedAssets: {},
  });

  // 加载通知设置
  useEffect(() => {
    async function loadSettings() {
      const result = await getNotificationSettings();
      if (result.success && result.data) {
        setNotificationSettings(result.data);
      }
    }
    loadSettings();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "两次输入的密码不一致" });
      return;
    }

    setLoading(true);
    const result = await updatePasswordAction(password);
    setLoading(false);

    if (result.success) {
      setMessage({ type: "success", text: "密码修改成功" });
      setPassword("");
      setConfirmPassword("");
    } else {
      setMessage({ type: "error", text: result.message || "修改失败" });
    }
  };

  // 保存通知设置
  const onNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifLoading(true);
    setNotifMessage(null);

    const result = await updateNotificationSettings(notificationSettings);
    setNotifLoading(false);

    if (result.success) {
      setNotifMessage({ type: "success", text: result.message || "保存成功" });
    } else {
      setNotifMessage({ type: "error", text: result.message || "保存失败" });
    }
  };

  // 测试通知
  const onTestNotification = async () => {
    setNotifLoading(true);
    setNotifMessage(null);

    try {
      // 先清除已通知记录
      const updatedSettings = {
        ...notificationSettings,
        notifiedAssets: {}
      };
      await updateNotificationSettings(updatedSettings);
      setNotificationSettings(updatedSettings);

      // 然后发送测试通知
      const response = await fetch("/api/notifications/test", { method: "POST" });
      const result = await response.json();

      if (result.success) {
        const messages = [];
        if (result.results.bark.enabled) {
          messages.push(`Bark: ${result.results.bark.success ? "✓ 成功" : "✗ 失败"}`);
        }
        if (result.results.telegram.enabled) {
          messages.push(`Telegram: ${result.results.telegram.success ? "✓ 成功" : "✗ 失败"}`);
        }
        setNotifMessage({
          type: "success",
          text: `测试通知已发送 - ${messages.join(", ")}`
        });
      } else {
        setNotifMessage({ type: "error", text: result.message || "测试失败" });
      }
    } catch (error) {
      setNotifMessage({ type: "error", text: "测试通知失败" });
    }

    setNotifLoading(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 修改密码卡片 */}
        <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>更新您的管理员登录密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {message && (
              <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-destructive"}`}>
                {message.text}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "提交中..." : "修改密码"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 到期通知设置卡片 */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>到期通知设置</CardTitle>
          <CardDescription>配置资产到期提醒功能</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">
          <form onSubmit={onNotificationSubmit} className="space-y-6">
            {/* 启用通知开关 */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notification-enabled">启用到期通知</Label>
                <p className="text-sm text-muted-foreground">开启后将自动检测资产到期情况并发送通知</p>
              </div>
              <Switch
                id="notification-enabled"
                checked={notificationSettings.enabled}
                onCheckedChange={(checked) =>
                  setNotificationSettings({ ...notificationSettings, enabled: checked })
                }
              />
            </div>

            {/* 通知时间设置 */}
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-2">
                <Label htmlFor="days-before">提前通知天数</Label>
                <Input
                  id="days-before"
                  type="number"
                  min="1"
                  max="365"
                  value={notificationSettings.daysBeforeExpiry}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      daysBeforeExpiry: parseInt(e.target.value) || 7
                    })
                  }
                  disabled={!notificationSettings.enabled}
                />
                <p className="text-sm text-muted-foreground">
                  在资产到期前多少天开始通知（每天重复通知直到到期后）
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notification-time">每日通知时间</Label>
                <Input
                  id="notification-time"
                  type="time"
                  value={notificationSettings.notificationTime}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      notificationTime: e.target.value
                    })
                  }
                  disabled={!notificationSettings.enabled}
                />
                <p className="text-sm text-muted-foreground">
                  每天在此时间检查并发送通知（精确到分钟）
                </p>
              </div>
            </div>

            {/* Bark 通知渠道 */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bark-enabled">Bark 通知</Label>
                  <p className="text-sm text-muted-foreground">通过 Bark 发送 iOS 推送通知</p>
                </div>
                <Switch
                  id="bark-enabled"
                  checked={notificationSettings.channels.bark.enabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      channels: {
                        ...notificationSettings.channels,
                        bark: { ...notificationSettings.channels.bark, enabled: checked }
                      }
                    })
                  }
                  disabled={!notificationSettings.enabled}
                />
              </div>

              {notificationSettings.channels.bark.enabled && (
                <div className="space-y-3 ml-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bark-server">Bark 服务器地址</Label>
                    <Input
                      id="bark-server"
                      type="url"
                      placeholder="https://api.day.app"
                      value={notificationSettings.channels.bark.serverUrl}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          channels: {
                            ...notificationSettings.channels,
                            bark: { ...notificationSettings.channels.bark, serverUrl: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bark-key">设备密钥</Label>
                    <Input
                      id="bark-key"
                      type="text"
                      placeholder="your_device_key"
                      value={notificationSettings.channels.bark.deviceKey}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          channels: {
                            ...notificationSettings.channels,
                            bark: { ...notificationSettings.channels.bark, deviceKey: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Telegram 通知渠道 */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="telegram-enabled">Telegram 通知</Label>
                  <p className="text-sm text-muted-foreground">通过 Telegram 机器人发送消息</p>
                </div>
                <Switch
                  id="telegram-enabled"
                  checked={notificationSettings.channels.telegram.enabled}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      channels: {
                        ...notificationSettings.channels,
                        telegram: { ...notificationSettings.channels.telegram, enabled: checked }
                      }
                    })
                  }
                  disabled={!notificationSettings.enabled}
                />
              </div>

              {notificationSettings.channels.telegram.enabled && (
                <div className="space-y-3 ml-4">
                  <div className="grid gap-2">
                    <Label htmlFor="telegram-token">Bot Token</Label>
                    <Input
                      id="telegram-token"
                      type="text"
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      value={notificationSettings.channels.telegram.botToken}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          channels: {
                            ...notificationSettings.channels,
                            telegram: { ...notificationSettings.channels.telegram, botToken: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="telegram-chat">Chat ID</Label>
                    <Input
                      id="telegram-chat"
                      type="text"
                      placeholder="123456789"
                      value={notificationSettings.channels.telegram.chatId}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          channels: {
                            ...notificationSettings.channels,
                            telegram: { ...notificationSettings.channels.telegram, chatId: e.target.value }
                          }
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {notifMessage && (
              <p className={`text-sm font-medium ${notifMessage.type === "success" ? "text-green-600" : "text-destructive"}`}>
                {notifMessage.text}
              </p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={notifLoading || !notificationSettings.enabled}
                onClick={onTestNotification}
              >
                {notifLoading ? "测试中..." : "测试通知"}
              </Button>
              <Button type="submit" className="flex-1" disabled={notifLoading}>
                {notifLoading ? "保存中..." : "保存通知设置"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}