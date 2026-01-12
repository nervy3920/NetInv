"use server";

import { readDb, writeDb } from "@/lib/db";
import { cookies } from "next/headers";

export async function loginAction(username: string, password: string) {
  const db = await readDb();
  const user = db.users.find(u => u.username === username && u.password === password);

  if (user) {
    const cookieStore = await cookies();
    cookieStore.set("auth", "true", { httpOnly: true });
    return { success: true };
  }

  return { success: false, message: "用户名或密码错误" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
}

export async function updatePasswordAction(newPassword: string) {
  try {
    const db = await readDb();
    // 假设只有一个管理员用户，或者当前登录的是 admin
    const adminIndex = db.users.findIndex(u => u.username === "admin");
    if (adminIndex !== -1) {
      db.users[adminIndex].password = newPassword;
      await writeDb(db);
      return { success: true };
    }
    return { success: false, message: "用户不存在" };
  } catch (error) {
    console.error("Update password error:", error);
    return { success: false, message: "修改失败" };
  }
}