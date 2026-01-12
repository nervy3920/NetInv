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
import { Pencil } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import { updateMainGroupAction } from "./actions";

interface EditMainGroupDialogProps {
  group: {
    id: number;
    name: string;
    icon: string | null;
  };
}

export function EditMainGroupDialog({ group }: EditMainGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(group.name);
  const [icon, setIcon] = useState(group.icon || "Box");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name) return;
    setLoading(true);
    const result = await updateMainGroupAction(group.id, name, icon);
    setLoading(false);
    if (result.success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑主分组</DialogTitle>
          <DialogDescription>
            修改资产大类的名称或图标。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">分组名称</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>选择图标</Label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={loading || !name}>
            {loading ? "保存中..." : "保存修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}