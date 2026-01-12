"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addAssetAction } from "../actions";
import { IconDisplay } from "@/components/icon-picker";
import { Switch } from "@/components/ui/switch";

interface AddAssetFormProps {
  groups: any[];
}

export function AddAssetForm({ groups }: AddAssetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [mainGroupId, setMainGroupId] = useState<string>("");
  const [subGroupId, setSubGroupId] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState("");
  const [expiryNotify, setExpiryNotify] = useState(false);
  const [notes, setNotes] = useState("");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  const selectedMainGroup = groups.find(g => g.id.toString() === mainGroupId);
  const selectedSubGroup = selectedMainGroup?.subGroups?.find((s: any) => s.id.toString() === subGroupId);

  // 当子分组改变时，初始化动态参数
  useEffect(() => {
    if (selectedSubGroup) {
      const config = JSON.parse(selectedSubGroup.config);
      const initialValues: Record<string, string> = {};
      config.forEach((item: any, index: number) => {
        // 使用索引作为键，避免同名参数冲突
        initialValues[index.toString()] = "";
      });
      setDynamicValues(initialValues);
    } else {
      setDynamicValues({});
    }
  }, [subGroupId, selectedSubGroup]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mainGroupId || !subGroupId) return;

    setLoading(true);
    const result = await addAssetAction({
      name,
      mainGroupId: parseInt(mainGroupId),
      subGroupId: parseInt(subGroupId),
      values: JSON.stringify(dynamicValues),
      expiryDate,
      expiryNotify,
      notes,
    });
    setLoading(false);

    if (result.success) {
      router.push("/dashboard/assets");
    } else {
      alert(result.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>添加新资产</CardTitle>
        <CardDescription>请选择分组并填写资产详细信息</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">资产名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：Web服务器-01"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>主分组</Label>
              <Select value={mainGroupId} onValueChange={(v) => {
                setMainGroupId(v);
                setSubGroupId("");
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="选择主分组" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>子分组</Label>
              <Select 
                value={subGroupId} 
                onValueChange={setSubGroupId}
                disabled={!mainGroupId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择子分组" />
                </SelectTrigger>
                <SelectContent>
                  {selectedMainGroup?.subGroups?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSubGroup && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">资产参数</h3>
                <div className="text-[10px] bg-primary/5 text-primary/70 px-2 py-1 rounded-md border border-primary/10">
                  提示：支持多值输入，格式为 <code className="font-mono font-bold text-primary">值 @ YYYY-MM-DD | 值 @ YYYY-MM-DD</code>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {JSON.parse(selectedSubGroup.config).map((item: any, index: number) => (
                  <div key={`${item.name}-${index}`} className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <IconDisplay name={item.icon || "Activity"} className="h-3.5 w-3.5 text-primary" />
                      {item.name} {item.unit ? `(${item.unit})` : ""}
                    </Label>
                    <Input
                      value={dynamicValues[index.toString()] || ""}
                      onChange={(e) => setDynamicValues({
                        ...dynamicValues,
                        [index.toString()]: e.target.value
                      })}
                      placeholder={`请输入${item.name}，格式：值 @ 到期时间 | ...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-2 border-t pt-4">
            <Label htmlFor="expiry">到期时间</Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-0.5">
              <Label htmlFor="expiry-notify">到期通知</Label>
              <p className="text-xs text-muted-foreground">在资产到期前发送通知提醒</p>
            </div>
            <Switch
              id="expiry-notify"
              checked={expiryNotify}
              onCheckedChange={setExpiryNotify}
            />
          </div>

          <div className="grid gap-2 border-t pt-4">
            <Label htmlFor="notes">备注信息</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="请输入资产备注信息..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "提交中..." : "确认添加"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}