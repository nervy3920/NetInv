"use server";

import { readDb, writeDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addMainGroupAction(name: string, icon: string) {
  try {
    const db = await readDb();
    db.mainGroups.push({
      id: db.nextIds.mainGroups++,
      name,
      icon
    });
    await writeDb(db);
    revalidatePath("/dashboard/groups");
    revalidatePath("/dashboard/assets/add");
    return { success: true };
  } catch (error) {
    console.error("Add main group error:", error);
    return { success: false, message: "添加失败" };
  }
}

export async function addSubGroupAction(parentId: number, name: string, icon: string, config: string) {
  try {
    const db = await readDb();
    db.subGroups.push({
      id: db.nextIds.subGroups++,
      parentId,
      name,
      icon,
      config
    });
    await writeDb(db);
    revalidatePath("/dashboard/groups");
    revalidatePath("/dashboard/assets/add");
    return { success: true };
  } catch (error) {
    console.error("Add sub group error:", error);
    return { success: false, message: "添加失败" };
  }
}

export async function updateMainGroupAction(id: number, name: string, icon: string) {
  try {
    const db = await readDb();
    const index = db.mainGroups.findIndex(g => g.id === id);
    if (index !== -1) {
      db.mainGroups[index] = { ...db.mainGroups[index], name, icon };
      await writeDb(db);
      revalidatePath("/dashboard/groups");
      revalidatePath("/dashboard/assets/add");
      return { success: true };
    }
    return { success: false, message: "分组不存在" };
  } catch (error) {
    return { success: false, message: "更新失败" };
  }
}

export async function updateSubGroupAction(id: number, name: string, icon: string, config: string, parentId?: number) {
  try {
    const db = await readDb();
    const index = db.subGroups.findIndex(g => g.id === id);
    if (index !== -1) {
      const oldParentId = db.subGroups[index].parentId;
      db.subGroups[index] = { 
        ...db.subGroups[index], 
        name, 
        icon, 
        config,
        parentId: parentId !== undefined ? parentId : db.subGroups[index].parentId
      };

      // 如果修改了父分组，同步更新该子分组下所有资产的主分组ID
      if (parentId !== undefined && parentId !== oldParentId) {
        db.assets.forEach(asset => {
          if (asset.subGroupId === id) {
            asset.mainGroupId = parentId;
          }
        });
      }

      await writeDb(db);
      revalidatePath("/dashboard/groups");
      revalidatePath("/dashboard/assets");
      revalidatePath("/dashboard/assets/add");
      return { success: true };
    }
    return { success: false, message: "子分组不存在" };
  } catch (error) {
    console.error("Update sub group error:", error);
    return { success: false, message: "更新失败" };
  }
}

export async function getMainGroupsWithSubGroups() {
  const db = await readDb();
  return db.mainGroups.map(mg => ({
    ...mg,
    subGroups: db.subGroups.filter(sg => sg.parentId === mg.id)
  }));
}

export async function deleteMainGroupAction(id: number) {
  try {
    const db = await readDb();
    const hasSubGroups = db.subGroups.some(sg => sg.parentId === id);
    if (hasSubGroups) {
      return { success: false, message: "删除失败，请先删除子分组" };
    }
    db.mainGroups = db.mainGroups.filter(g => g.id !== id);
    await writeDb(db);
    revalidatePath("/dashboard/groups");
    revalidatePath("/dashboard/assets/add");
    return { success: true };
  } catch (error) {
    return { success: false, message: "删除失败" };
  }
}

export async function deleteSubGroupAction(id: number) {
  try {
    const db = await readDb();
    db.subGroups = db.subGroups.filter(g => g.id !== id);
    // 同时删除关联的资产
    db.assets = db.assets.filter(a => a.subGroupId !== id);
    await writeDb(db);
    revalidatePath("/dashboard/groups");
    revalidatePath("/dashboard/assets");
    revalidatePath("/dashboard/assets/add");
    return { success: true };
  } catch (error) {
    return { success: false, message: "删除失败" };
  }
}

export async function copyMainGroupAction(id: number) {
  try {
    const db = await readDb();
    const group = db.mainGroups.find(g => g.id === id);
    if (!group) return { success: false, message: "分组不存在" };

    const newGroupId = db.nextIds.mainGroups++;
    db.mainGroups.push({
      id: newGroupId,
      name: `${group.name} (副本)`,
      icon: group.icon
    });

    const relatedSubGroups = db.subGroups.filter(sg => sg.parentId === id);
    for (const sub of relatedSubGroups) {
      db.subGroups.push({
        id: db.nextIds.subGroups++,
        parentId: newGroupId,
        name: sub.name,
        icon: sub.icon,
        config: sub.config
      });
    }

    await writeDb(db);
    revalidatePath("/dashboard/groups");
    revalidatePath("/dashboard/assets/add");
    return { success: true };
  } catch (error) {
    console.error("Copy main group error:", error);
    return { success: false, message: "复制失败" };
  }
}

export async function copySubGroupAction(id: number) {
  try {
    const db = await readDb();
    const sub = db.subGroups.find(g => g.id === id);
    if (!sub) return { success: false, message: "子分组不存在" };

    db.subGroups.push({
      id: db.nextIds.subGroups++,
      parentId: sub.parentId,
      name: `${sub.name} (副本)`,
      icon: sub.icon,
      config: sub.config
    });

    await writeDb(db);
    revalidatePath("/dashboard/groups");
    revalidatePath("/dashboard/assets/add");
    return { success: true };
  } catch (error) {
    console.error("Copy sub group error:", error);
    return { success: false, message: "复制失败" };
  }
}