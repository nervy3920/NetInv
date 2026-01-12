"use server";

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

const UPLOAD_DIR = path.join(process.cwd(), 'data', 'icons');

export async function uploadIconAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) return { success: false, message: "没有文件" };

    // 确保目录存在
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name);
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileName = `${Date.now()}-${randomString}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    revalidatePath("/dashboard/groups");
    return { success: true, fileName };
  } catch (error) {
    console.error("Upload icon error:", error);
    return { success: false, message: "上传失败" };
  }
}

export async function getCustomIconsAction() {
  try {
    try {
      await fs.access(UPLOAD_DIR);
    } catch {
      return [];
    }
    const files = await fs.readdir(UPLOAD_DIR);
    return files.filter(f => /\.(svg|png|jpg|jpeg|gif)$/i.test(f));
  } catch (error) {
    console.error("Get custom icons error:", error);
    return [];
  }
}

export async function deleteIconAction(fileName: string) {
  try {
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.unlink(filePath);
    revalidatePath("/dashboard/groups");
    return { success: true };
  } catch (error) {
    console.error("Delete icon error:", error);
    return { success: false, message: "删除失败" };
  }
}