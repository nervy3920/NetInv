import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readDb } from "@/lib/db";
import { LayoutGrid, FolderTree, Box } from "lucide-react";

export default async function DashboardPage() {
  const db = await readDb();
  
  const stats = [
    {
      title: "主分组",
      value: db.mainGroups.length,
      icon: LayoutGrid,
      description: "已创建的资产大类",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "子分组",
      value: db.subGroups.length,
      icon: FolderTree,
      description: "细分的资产类型",
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "总资产",
      value: db.assets.length,
      icon: Box,
      description: "当前管理的所有资产",
      color: "text-green-600",
      bg: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
        <p className="text-muted-foreground">欢迎回来，这是您的网络资产概览。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-md ring-1 ring-border/50 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full border-none shadow-md ring-1 ring-border/50">
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex h-2 w-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium">系统运行正常</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              所有数据已同步至本地 JSON 存储。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}