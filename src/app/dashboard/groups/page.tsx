import { getMainGroupsWithSubGroups } from "./actions";
import { GroupList } from "./group-list";
import { AddMainGroupDialog } from "./add-main-group-dialog";

export default async function GroupsPage() {
  const groups = await getMainGroupsWithSubGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">管理您的资产分类和参数配置</p>
        <AddMainGroupDialog />
      </div>
      <GroupList initialGroups={groups} />
    </div>
  );
}