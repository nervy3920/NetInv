"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconDisplay } from "@/components/icon-picker";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, MoreVertical, Copy } from "lucide-react";
import { deleteMainGroupAction, deleteSubGroupAction, copyMainGroupAction, copySubGroupAction } from "./actions";
import { AddSubGroupDialog } from "./add-sub-group-dialog";
import { EditMainGroupDialog } from "./edit-main-group-dialog";
import { EditSubGroupDialog } from "./edit-sub-group-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroupListProps {
  initialGroups: any[];
}

export function GroupList({ initialGroups }: GroupListProps) {
  const onDeleteMain = async (id: number) => {
    if (confirm("确定要删除这个主分组吗？")) {
      const result = await deleteMainGroupAction(id);
      if (!result.success) alert(result.message);
    }
  };

  const onDeleteSub = async (id: number) => {
    if (confirm("确定要删除这个子分组吗？")) {
      await deleteSubGroupAction(id);
    }
  };

  const onCopyMain = async (id: number) => {
    const result = await copyMainGroupAction(id);
    if (!result.success) alert(result.message);
  };

  const onCopySub = async (id: number) => {
    const result = await copySubGroupAction(id);
    if (!result.success) alert(result.message);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {initialGroups.map((group) => (
        <Card key={group.id} className="overflow-hidden border-none shadow-md ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/20 pb-3 pt-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconDisplay name={group.icon} className="h-5 w-5" />
              </div>
              <CardTitle className="text-base font-semibold tracking-tight">{group.name}</CardTitle>
            </div>
            <div className="flex items-center space-x-1">
              <EditMainGroupDialog group={group} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCopyMain(group.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    复制分组
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDeleteMain(group.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除分组
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">子分组</h4>
                <AddSubGroupDialog parentId={group.id} />
              </div>
              <div className="space-y-2">
                {group.subGroups?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <p className="text-xs text-muted-foreground italic">暂无子分组</p>
                  </div>
                )}
                {group.subGroups?.map((sub: any) => (
                  <div 
                    key={sub.id} 
                    className="group flex items-center justify-between rounded-lg border border-border/50 bg-card p-2.5 text-sm transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <IconDisplay name={sub.icon} className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">{sub.name}</span>
                    </div>
                    <div className="flex items-center space-x-1 transition-opacity">
                      <EditSubGroupDialog subGroup={sub} />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={() => onCopySub(sub.id)}
                        title="复制子分组"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteSub(sub.id)}
                        title="删除子分组"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}