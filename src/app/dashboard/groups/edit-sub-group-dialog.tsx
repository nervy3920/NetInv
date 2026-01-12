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
import { Pencil, X, PlusCircle, GripVertical } from "lucide-react";
import { IconPicker } from "@/components/icon-picker";
import { updateSubGroupAction, getMainGroupsWithSubGroups } from "./actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ConfigItem {
  id: string; // 增加 ID 用于拖拽排序
  name: string;
  unit: string;
  icon: string;
}

interface EditSubGroupDialogProps {
  subGroup: {
    id: number;
    parentId: number;
    name: string;
    icon: string | null;
    config: string;
  };
}

function SortableConfigItem({
  item,
  index,
  updateConfig,
  removeConfig,
  disabledRemove,
}: {
  item: ConfigItem;
  index: number;
  updateConfig: (index: number, field: keyof ConfigItem, value: string) => void;
  removeConfig: (index: number) => void;
  disabledRemove: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-end gap-2 p-3 rounded-lg border border-dashed bg-muted/10"
    >
      <div
        {...attributes}
        {...listeners}
        className="mb-2 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid w-24 gap-1.5">
        <Label className="text-xs">图标</Label>
        <IconPicker value={item.icon} onChange={(v) => updateConfig(index, "icon", v)} />
      </div>
      <div className="grid flex-1 gap-1.5">
        <Label className="text-xs">参数名</Label>
        <Input
          value={item.name}
          onChange={(e) => updateConfig(index, "name", e.target.value)}
        />
      </div>
      <div className="grid w-20 gap-1.5">
        <Label className="text-xs">单位</Label>
        <Input
          value={item.unit}
          onChange={(e) => updateConfig(index, "unit", e.target.value)}
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 text-muted-foreground hover:text-destructive"
        onClick={() => removeConfig(index)}
        disabled={disabledRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function EditSubGroupDialog({ subGroup }: EditSubGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [parentId, setParentId] = useState<number>(subGroup.parentId);
  const [mainGroups, setMainGroups] = useState<any[]>([]);
  const [name, setName] = useState(subGroup.name);
  const [icon, setIcon] = useState(subGroup.icon || "Box");
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getMainGroupsWithSubGroups().then(setMainGroups);
      // 初始化时为每个配置项生成唯一 ID
      const initialConfig = JSON.parse(subGroup.config).map((c: any, i: number) => ({
        ...c,
        id: c.id || `item-${i}-${Date.now()}`,
        icon: c.icon || "Activity"
      }));
      setConfig(initialConfig);
    }
  }, [open, subGroup.config]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setConfig((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addConfig = () => setConfig([...config, { id: `item-${Date.now()}`, name: "", unit: "", icon: "Activity" }]);
  const removeConfig = (index: number) => setConfig(config.filter((_, i) => i !== index));
  const updateConfig = (index: number, field: keyof ConfigItem, value: string) => {
    const newConfig = [...config];
    (newConfig[index] as any)[field] = value;
    setConfig(newConfig);
  };

  const onSubmit = async () => {
    if (!name) return;
    setLoading(true);
    // 提交前移除 ID 字段，保持数据简洁
    const filteredConfig = config
      .filter(c => c.name.trim() !== "")
      .map(({ id, ...rest }) => rest);
    
    const result = await updateSubGroupAction(
      subGroup.id, 
      name, 
      icon, 
      JSON.stringify(filteredConfig),
      parentId
    );
    setLoading(false);
    if (result.success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑子分组</DialogTitle>
          <DialogDescription>
            修改子分组名称、图标或参数配置。您可以拖动参数左侧的手柄进行排序。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>所属主分组</Label>
            <Select value={parentId.toString()} onValueChange={(v) => setParentId(parseInt(v))}>
              <SelectTrigger>
                <SelectValue placeholder="选择主分组" />
              </SelectTrigger>
              <SelectContent>
                {mainGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-sub-name">子分组名称</Label>
            <Input
              id="edit-sub-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={config.map(i => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {config.map((item, index) => (
                    <SortableConfigItem
                      key={item.id}
                      item={item}
                      index={index}
                      updateConfig={updateConfig}
                      removeConfig={removeConfig}
                      disabledRemove={config.length === 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
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