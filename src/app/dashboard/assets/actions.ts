"use server";

import { readDb, writeDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getGroupsForAssetAdd() {
  const db = await readDb();
  return db.mainGroups.map(mg => ({
    ...mg,
    subGroups: db.subGroups.filter(sg => sg.parentId === mg.id)
  }));
}

export async function addAssetAction(data: {
  name: string;
  mainGroupId: number;
  subGroupId: number;
  values: string;
  expiryDate: string;
  expiryNotify: boolean;
  notes?: string;
}) {
  try {
    const db = await readDb();
    db.assets.push({
      id: db.nextIds.assets++,
      name: data.name,
      mainGroupId: data.mainGroupId,
      subGroupId: data.subGroupId,
      values: data.values,
      expiryDate: data.expiryDate || null,
      expiryNotify: data.expiryNotify,
      notes: data.notes || "",
      createdAt: Date.now()
    });
    await writeDb(db);
    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error) {
    console.error("Add asset error:", error);
    return { success: false, message: "添加资产失败" };
  }
}

export async function updateAssetAction(id: number, data: {
  name: string;
  values: string;
  expiryDate: string;
  expiryNotify?: boolean;
  notes?: string;
}) {
  try {
    const db = await readDb();
    const index = db.assets.findIndex(a => a.id === id);
    if (index !== -1) {
      db.assets[index] = {
        ...db.assets[index],
        name: data.name,
        values: data.values,
        expiryDate: data.expiryDate || null,
        expiryNotify: data.expiryNotify !== undefined ? data.expiryNotify : db.assets[index].expiryNotify,
        notes: data.notes !== undefined ? data.notes : db.assets[index].notes
      };
      await writeDb(db);
      revalidatePath("/dashboard/assets");
      return { success: true };
    }
    return { success: false, message: "资产不存在" };
  } catch (error) {
    console.error("Update asset error:", error);
    return { success: false, message: "更新资产失败" };
  }
}

export async function getAssets() {
  const db = await readDb();
  return db.assets.map(asset => ({
    ...asset,
    mainGroup: db.mainGroups.find(mg => mg.id === asset.mainGroupId),
    subGroup: db.subGroups.find(sg => sg.id === asset.subGroupId)
  })).sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteAssetAction(id: number) {
  try {
    const db = await readDb();
    db.assets = db.assets.filter(a => a.id !== id);
    await writeDb(db);
    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error) {
    return { success: false, message: "删除失败" };
  }
}

export async function copyAssetAction(id: number) {
  try {
    const db = await readDb();
    const asset = db.assets.find(a => a.id === id);
    if (!asset) return { success: false, message: "资产不存在" };

    const newAsset = {
      ...asset,
      id: db.nextIds.assets++,
      name: `${asset.name} (复制)`,
      createdAt: Date.now()
    };

    db.assets.push(newAsset);
    await writeDb(db);
    revalidatePath("/dashboard/assets");
    return { success: true };
  } catch (error) {
    console.error("Copy asset error:", error);
    return { success: false, message: "复制资产失败" };
  }
}