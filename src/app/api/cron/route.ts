import { NextResponse } from "next/server";

/**
 * Cron job endpoint - 可以通过外部定时任务服务调用
 * 例如: cron-job.org, EasyCron, 或服务器的 crontab
 */
export async function GET(request: Request) {
  try {
    // 验证请求来源（可选，增加安全性）
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "未授权" },
        { status: 401 }
      );
    }

    // 调用通知检查 API
    const baseUrl = request.headers.get("host");
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const checkUrl = `${protocol}://${baseUrl}/api/notifications/check`;

    const response = await fetch(checkUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { success: false, message: "定时任务执行失败" },
      { status: 500 }
    );
  }
}
