"use client";

import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (pathname === "/dashboard") return "仪表盘";
    if (pathname === "/dashboard/assets") return "资产列表";
    if (pathname === "/dashboard/groups") return "分组管理";
    if (pathname === "/dashboard/assets/add") return "添加资产";
    if (pathname === "/dashboard/settings") return "系统设置";
    return "管理系统";
  };

  return (
    <header className="h-20 border-b flex items-center px-8 bg-background/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight">{getTitle()}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {pathname === "/dashboard" && "欢迎回来，管理员"}
          {pathname === "/dashboard/assets" && "管理和监控您的网络资产"}
          {pathname === "/dashboard/groups" && "配置资产分类和自定义参数"}
          {pathname === "/dashboard/assets/add" && "录入新的网络资产信息"}
          {pathname === "/dashboard/settings" && "管理您的账户安全和系统偏好"}
        </p>
      </div>
    </header>
  );
}