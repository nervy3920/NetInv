"use client";

import { useState, useEffect } from "react";
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
import { Plus } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import { addMainGroupAction } from "./actions";

export function AddMainGroupDialog() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);
  const [icon, setIcon] = useState("Box");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name) return;
    setLoading(true);
    const result = await addMainGroupAction(name, icon);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setName("");
      setIcon("Box");
    }
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加主分组
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加主分组</DialogTitle>
          <DialogDescription>
            创建一个新的资产大类，例如：服务器、网络设备等。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">分组名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：服务器"
            />
          </div>
          <div className="grid gap-2">
            <Label>选择图标</Label>
            <IconPicker value={icon} onChange={setIcon} />
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