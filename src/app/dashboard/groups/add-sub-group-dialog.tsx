"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, PlusCircle } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import { addSubGroupAction } from "./actions";

interface ConfigItem {
  name: string;
  unit: string;
  icon: string;
}

export function AddSubGroupDialog({ parentId }: { parentId: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Box");
  const [config, setConfig] = useState<ConfigItem[]>([{ name: "", unit: "", icon: "Activity" }]);
  const [loading, setLoading] = useState(false);

  const addConfig = () => setConfig([...config, { name: "", unit: "", icon: "Activity" }]);
  const removeConfig = (index: number) => setConfig(config.filter((_, i) => i !== index));
  const updateConfig = (index: number, field: keyof ConfigItem, value: string) => {
    const newConfig = [...config];
    (newConfig[index] as any)[field] = value;
    setConfig(newConfig);
  };

  const onSubmit = async () => {
    if (!name) return;
    setLoading(true);
    // 过滤掉空的参数
    const filteredConfig = config.filter(c => c.name.trim() !== "");
    const result = await addSubGroupAction(parentId, name, icon, JSON.stringify(filteredConfig));
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setName("");
      setIcon("Box");
      setConfig([{ name: "", unit: "", icon: "Activity" }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-3 w-3" />
          添加子分组
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加子分组</DialogTitle>
          <DialogDescription>
            为当前主分组添加子类，并配置该类资产需要填写的参数和单位。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sub-name">子分组名称</Label>
            <Input
              id="sub-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：物理服务器"
            />
          </div>
          <div className="grid gap-2">
            <Label>选择图标</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>参数配置</Label>
              <Button type="button" variant="outline" size="sm" onClick={addConfig}>
                <PlusCircle className="mr-1 h-3 w-3" />
                添加参数
              </Button>
            </div>
            {config.map((item, index) => (
              <div key={index} className="flex items-end gap-2 p-3 rounded-lg border border-dashed bg-muted/10">
                <div className="grid w-24 gap-1.5">
                  <Label className="text-xs">图标</Label>
                  <IconPicker value={item.icon} onChange={(v) => updateConfig(index, "icon", v)} />
                </div>
                <div className="grid flex-1 gap-1.5">
                  <Label className="text-xs">参数名</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateConfig(index, "name", e.target.value)}
                    placeholder="如：CPU"
                  />
                </div>
                <div className="grid w-20 gap-1.5">
                  <Label className="text-xs">单位</Label>
                  <Input
                    value={item.unit}
                    onChange={(e) => updateConfig(index, "unit", e.target.value)}
                    placeholder="如：核"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-muted-foreground hover:text-destructive"
                  onClick={() => removeConfig(index)}
                  disabled={config.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={loading || !name}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}