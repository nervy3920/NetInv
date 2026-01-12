"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderTree, 
  PlusCircle, 
  Settings, 
  LogOut,
  Database,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/login/actions";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const routes = [
  {
    label: "仪表盘",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "资产列表",
    icon: Database,
    href: "/dashboard/assets",
    color: "text-violet-500",
  },
  {
    label: "分组管理",
    icon: FolderTree,
    href: "/dashboard/groups",
    color: "text-pink-700",
  },
  {
    label: "添加资产",
    icon: PlusCircle,
    href: "/dashboard/assets/add",
    color: "text-orange-700",
  },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <div className={cn("flex flex-col h-full bg-card text-card-foreground", className)}>
      <div className="px-6 py-8 flex items-center">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
          <Database className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">资产管理</h1>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
                pathname === route.href 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color)} />
                {route.label}
              </div>
              {pathname === route.href && <ChevronRight className="h-4 w-4 opacity-50" />}
            </Link>
          ))}
        </div>
        
        <Separator className="my-4 mx-2 opacity-50" />
        
        <div className="space-y-1">
          <Link
            href="/dashboard/settings"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200",
              pathname === "/dashboard/settings" 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <div className="flex items-center flex-1">
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              系统设置
            </div>
          </Link>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <Button 
          onClick={onLogout} 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl h-12"
        >
          <LogOut className="h-5 w-5 mr-3" />
          退出登录
        </Button>
      </div>
    </div>
  );
}