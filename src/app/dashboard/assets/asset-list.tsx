"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconDisplay } from "@/components/icon-picker";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Filter, LayoutGrid, Edit2, X, Check, Bell, BellOff, Copy, FileText } from "lucide-react";
import { deleteAssetAction, updateAssetAction, copyAssetAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AssetListProps {
  initialAssets: any[];
}

export function AssetList({ initialAssets }: AssetListProps) {
  const [filterGroupId, setFilterGroupId] = useState<string>("all");
  const [filterSubGroupId, setFilterSubGroupId] = useState<string>("all");
  const [editingId, setEditingId] = useState<number | null>(null);

  const getExpiryStatus = (dateStr: string) => {
    if (!dateStr) return null;
    const expiryDate = new Date(dateStr);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffTime < 0) {
      return { label: "已到期", color: "text-destructive bg-destructive/10 border-destructive/20" };
    }
    if (diffDays <= 30) {
      return { label: `${diffDays}天后到期`, color: "text-orange-600 bg-orange-50 border-orange-200" };
    }
    return { label: `${diffDays}天后到期`, color: "text-green-600 bg-green-50 border-green-200" };
  };
  const [editForm, setEditForm] = useState<{
    name: string;
    values: Record<string, string>;
    expiryDate: string;
    expiryNotify: boolean;
    notes: string;
  } | null>(null);

  const startEditing = (asset: any) => {
    setEditingId(asset.id);
    setEditForm({
      name: asset.name,
      values: JSON.parse(asset.values),
      expiryDate: asset.expiryDate || "",
      expiryNotify: asset.expiryNotify,
      notes: asset.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const onUpdate = async (id: number) => {
    if (!editForm) return;
    const result = await updateAssetAction(id, {
      name: editForm.name,
      values: JSON.stringify(editForm.values),
      expiryDate: editForm.expiryDate,
      expiryNotify: editForm.expiryNotify,
      notes: editForm.notes,
    });
    if (result.success) {
      setEditingId(null);
      setEditForm(null);
    } else {
      alert(result.message);
    }
  };

  const onDelete = async (id: number) => {
    if (confirm("确定要删除这个资产吗？")) {
      await deleteAssetAction(id);
    }
  };

  const onCopy = async (id: number) => {
    const result = await copyAssetAction(id);
    if (!result.success) {
      alert(result.message);
    }
  };

  // 获取所有唯一的主分组用于筛选
  const mainGroups = Array.from(new Map(initialAssets.map(a => [a.mainGroup.id, a.mainGroup])).values());

  // 获取当前选中主分组下的子分组
  const subGroups = filterGroupId === "all"
    ? Array.from(new Map(initialAssets.map(a => [a.subGroup.id, a.subGroup])).values())
    : Array.from(new Map(
        initialAssets
          .filter(a => a.mainGroup.id.toString() === filterGroupId)
          .map(a => [a.subGroup.id, a.subGroup])
      ).values());

  const filteredAssets = initialAssets.filter(a => {
    const matchMain = filterGroupId === "all" || a.mainGroup.id.toString() === filterGroupId;
    const matchSub = filterSubGroupId === "all" || a.subGroup.id.toString() === filterSubGroupId;
    return matchMain && matchSub;
  });

  const handleMainGroupChange = (value: string) => {
    setFilterGroupId(value);
    setFilterSubGroupId("all");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>主分组: {filterGroupId === "all" ? "全部" : mainGroups.find(g => g.id.toString() === filterGroupId)?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>按主分组筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filterGroupId} onValueChange={handleMainGroupChange}>
                <DropdownMenuRadioItem value="all">全部主分组</DropdownMenuRadioItem>
                {mainGroups.map((group) => (
                  <DropdownMenuRadioItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <Filter className="h-3.5 w-3.5" />
                <span>子分组: {filterSubGroupId === "all" ? "全部" : subGroups.find(g => g.id.toString() === filterSubGroupId)?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>按子分组筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filterSubGroupId} onValueChange={setFilterSubGroupId}>
                <DropdownMenuRadioItem value="all">全部子分组</DropdownMenuRadioItem>
                {subGroups.map((group) => (
                  <DropdownMenuRadioItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Badge variant="secondary" className="h-6 px-2 font-normal text-muted-foreground">
            共 {filteredAssets.length} 个资产
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted/10 rounded-xl border-2 border-dashed border-muted">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="rounded-full bg-muted p-4">
                <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground font-medium">暂无资产数据</p>
            </div>
          </div>
        )}
        {filteredAssets.map((asset) => {
          const values = JSON.parse(asset.values);
          const config = JSON.parse(asset.subGroup.config);
          const isExpired = asset.expiryDate && new Date(asset.expiryDate) < new Date();

          const isEditing = editingId === asset.id;

          return (
            <Card key={asset.id} className={cn(
              "group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full min-h-[280px]",
              isEditing ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/20"
            )}>
              <CardHeader className="p-4 pb-3 bg-muted/30 border-b border-border/50 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 flex-1 mr-2">
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <Input
                          value={editForm?.name}
                          onChange={(e) => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                          className="h-7 text-sm font-bold py-0"
                        />
                      ) : (
                        <CardTitle className="text-base font-bold truncate">{asset.name}</CardTitle>
                      )}
                      <Badge variant="outline" className="text-[10px] h-4 px-1 font-mono shrink-0">#{asset.id.toString().padStart(4, '0')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-primary">
                        <IconDisplay name={asset.mainGroup.icon} className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold">{asset.mainGroup.name}</span>
                      </div>
                      <span className="text-muted-foreground/30 text-[10px]">/</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <IconDisplay name={asset.subGroup.icon} className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{asset.subGroup.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-green-600 hover:bg-green-50"
                          onClick={() => onUpdate(asset.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:bg-muted"
                          onClick={cancelEditing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          onClick={() => startEditing(asset)}
                          title="编辑资产"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          onClick={() => onCopy(asset.id)}
                          title="复制资产"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => onDelete(asset.id)}
                          title="删除资产"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-2 flex-1 content-start">
                  {config.flatMap((item: any, index: number) => {
                    // 优先使用索引作为键，如果不存在则回退到名称（兼容旧数据）
                    const rawValue = values[index.toString()] !== undefined ? values[index.toString()] : (values[item.name] || "-");
                    const splitValues = rawValue.split("|").map((v: string) => v.trim());
                    
                    // 尝试解析到期时间，格式：值 @ YYYY-MM-DD
                    const parsedValues = splitValues.map((v: string) => {
                      const parts = v.split("@");
                      return {
                        val: parts[0].trim(),
                        expiry: parts[1]?.trim() || null
                      };
                    });

                    if (isEditing) {
                      return [(
                        <div key={`${item.name}-${index}`} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors h-full shrink-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              <IconDisplay name={item.icon || "Activity"} className="w-4 h-4 text-primary/70" />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-black uppercase truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <Input
                              value={editForm?.values[index.toString()] !== undefined ? editForm?.values[index.toString()] : (editForm?.values[item.name] || "")}
                              onChange={(e) => setEditForm(prev => {
                                if (!prev) return null;
                                return {
                                  ...prev,
                                  values: { ...prev.values, [index.toString()]: e.target.value }
                                };
                              })}
                              className="h-6 w-20 text-xs py-0 px-1"
                              placeholder="值 @ 到期时间 | ..."
                            />
                          </div>
                        </div>
                      )];
                    }

                    return parsedValues.map((itemValue: any, i: number) => (
                      <div key={`${item.name}-${index}-${i}`} className="flex flex-col p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors h-full shrink-0 gap-1.5 justify-center">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-4 h-4 flex items-center justify-center shrink-0">
                              <IconDisplay name={item.icon || "Activity"} className="w-4 h-4 text-primary/70" />
                            </div>
                            <span className="text-[11px] text-muted-foreground font-black uppercase truncate">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <span className="text-sm font-black text-foreground">{itemValue.val}</span>
                            {item.unit && <span className="text-[11px] text-muted-foreground font-black">{item.unit}</span>}
                          </div>
                        </div>
                        {itemValue.expiry && (
                          <div className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-black uppercase self-end",
                            getExpiryStatus(itemValue.expiry)?.color
                          )}>
                            <Calendar className="h-2.5 w-2.5" />
                            <span>{getExpiryStatus(itemValue.expiry)?.label}</span>
                            <span className="opacity-70">({itemValue.expiry})</span>
                          </div>
                        )}
                      </div>
                    ));
                  })}
                </div>
                
                <div className="pt-3 border-t border-border/50 mt-auto shrink-0 space-y-3">
                  {isEditing ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-bold">到期时间</span>
                      </div>
                      <Input
                        type="date"
                        value={editForm?.expiryDate}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, expiryDate: e.target.value} : null)}
                        className="h-7 text-xs w-32 py-0"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-bold">到期时间</span>
                      </div>
                      {asset.expiryDate ? (
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-black uppercase tracking-tight",
                          getExpiryStatus(asset.expiryDate)?.color
                        )}>
                          <span>{getExpiryStatus(asset.expiryDate)?.label}</span>
                          <span className="font-bold">({asset.expiryDate})</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-bold">-</span>
                      )}
                    </div>
                  )}

                  {isEditing ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-bold">到期通知</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 px-2 text-xs gap-1",
                          editForm?.expiryNotify ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted"
                        )}
                        onClick={() => setEditForm(prev => prev ? {...prev, expiryNotify: !prev.expiryNotify} : null)}
                      >
                        {editForm?.expiryNotify ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
                        {editForm?.expiryNotify ? "开启" : "关闭"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-bold">到期通知</span>
                      </div>
                      <Badge variant={asset.expiryNotify ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                        {asset.expiryNotify ? "已开启" : "已关闭"}
                      </Badge>
                    </div>
                  )}
                  {isEditing ? (
                    <div className="space-y-2 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-bold">备注信息</span>
                      </div>
                      <textarea
                        value={editForm?.notes}
                        onChange={(e) => setEditForm(prev => prev ? {...prev, notes: e.target.value} : null)}
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="请输入备注信息..."
                      />
                    </div>
                  ) : asset.notes && (
                    <div className="pt-3 border-t border-border/50 space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary/60" />
                        <span className="text-xs text-muted-foreground font-bold">备注信息</span>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{asset.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}