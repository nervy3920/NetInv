export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initDb } = await import('./lib/db');
    const { startNotificationScheduler } = await import('./lib/notification-scheduler');

    try {
      await initDb();
      console.log("Database initialized successfully");

      // 启动后台通知调度器
      startNotificationScheduler();
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  }
}