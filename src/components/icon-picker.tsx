"use client";

import { useState, useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { uploadIconAction, getCustomIconsAction, deleteIconAction } from "@/app/dashboard/groups/upload-action";
import { Upload, Image as ImageIcon, Loader2, X } from "lucide-react";

// 模拟云厂商风格的图标映射
export const iconList = [
  // 操作系统 (模拟)
  { name: "Windows", icon: LucideIcons.LayoutGrid },
  { name: "Linux", icon: LucideIcons.Terminal },
  { name: "Ubuntu", icon: LucideIcons.CircleDot },
  { name: "CentOS", icon: LucideIcons.Disc },
  { name: "Debian", icon: LucideIcons.Loader },
  { name: "Android", icon: LucideIcons.Smartphone },
  { name: "iOS", icon: LucideIcons.Apple },
  { name: "MacOS", icon: LucideIcons.Monitor },
  { name: "Docker", icon: LucideIcons.Container },
  { name: "Kubernetes", icon: LucideIcons.ShipWheel },

  // 硬件 & 核心参数
  { name: "Cpu", icon: LucideIcons.Cpu },
  { name: "Memory", icon: LucideIcons.MemoryStick },
  { name: "HardDrive", icon: LucideIcons.HardDrive },
  { name: "Activity", icon: LucideIcons.Activity },
  { name: "Zap", icon: LucideIcons.Zap },
  { name: "Gauge", icon: LucideIcons.Gauge },
  { name: "MapPin", icon: LucideIcons.MapPin },
  { name: "Globe", icon: LucideIcons.Globe },
  
  // 云服务商 (模拟)
  { name: "Aliyun", icon: LucideIcons.Cloud },
  { name: "Tencent", icon: LucideIcons.Trello },
  { name: "AWS", icon: LucideIcons.Triangle },
  { name: "Azure", icon: LucideIcons.Square },
  { name: "GoogleCloud", icon: LucideIcons.Chrome },
  { name: "HuaweiCloud", icon: LucideIcons.Flower2 },
  { name: "DigitalOcean", icon: LucideIcons.Droplets },
  { name: "Linode", icon: LucideIcons.Leaf },
  { name: "Vultr", icon: LucideIcons.CloudLightning },
  { name: "Oracle", icon: LucideIcons.CircleDot },
  
  // 影视平台 (模拟)
  { name: "Netflix", icon: LucideIcons.Tv },
  { name: "YouTube", icon: LucideIcons.Youtube },
  { name: "DisneyPlus", icon: LucideIcons.Sparkles },
  { name: "Bilibili", icon: LucideIcons.Tv2 },
  { name: "TikTok", icon: LucideIcons.Music2 },
  { name: "PrimeVideo", icon: LucideIcons.PlayCircle },
  
  // 社交软件 (模拟)
  { name: "WeChat", icon: LucideIcons.MessageCircle },
  { name: "Telegram", icon: LucideIcons.Send },
  { name: "Discord", icon: LucideIcons.Gamepad2 },
  { name: "Twitter", icon: LucideIcons.Twitter },
  { name: "Facebook", icon: LucideIcons.Facebook },
  { name: "Instagram", icon: LucideIcons.Instagram },
  { name: "WhatsApp", icon: LucideIcons.PhoneCall },
  { name: "Github", icon: LucideIcons.Github },
  
  // 购物平台 (模拟)
  { name: "Taobao", icon: LucideIcons.ShoppingBag },
  { name: "JD", icon: LucideIcons.Truck },
  { name: "Amazon", icon: LucideIcons.ShoppingCart },
  { name: "Pinduoduo", icon: LucideIcons.PackageSearch },
  
  // 基础 & 网络
  { name: "Server", icon: LucideIcons.Server },
  { name: "Database", icon: LucideIcons.Database },
  { name: "Network", icon: LucideIcons.Network },
  { name: "Router", icon: LucideIcons.Router },
  { name: "Wifi", icon: LucideIcons.Wifi },
  { name: "Shield", icon: LucideIcons.Shield },
  { name: "Lock", icon: LucideIcons.Lock },
  { name: "Key", icon: LucideIcons.Key },
  { name: "Terminal", icon: LucideIcons.Terminal },
  { name: "Code", icon: LucideIcons.Code },
  
  // 其他常用
  { name: "Bell", icon: LucideIcons.Bell },
  { name: "Calendar", icon: LucideIcons.Calendar },
  { name: "Clock", icon: LucideIcons.Clock },
  { name: "CreditCard", icon: LucideIcons.CreditCard },
  { name: "Mail", icon: LucideIcons.Mail },
  { name: "Search", icon: LucideIcons.Search },
  { name: "Settings", icon: LucideIcons.Settings },
  { name: "Star", icon: LucideIcons.Star },
  { name: "Tag", icon: LucideIcons.Tag },
  { name: "Trash", icon: LucideIcons.Trash },
  { name: "User", icon: LucideIcons.User },
  { name: "Video", icon: LucideIcons.Video },
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [customIcons, setCustomIcons] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    if (open) {
      getCustomIconsAction().then(setCustomIcons);
    }
  }, [open]);

  if (!mounted) {
    return (
      <div className="w-12 h-10 border rounded-md flex items-center justify-center bg-background opacity-50">
        <LucideIcons.Box className="h-4 w-4 text-primary" />
      </div>
    );
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadIconAction(formData);
    setUploading(false);

    if (result.success && result.fileName) {
      setCustomIcons(prev => [result.fileName!, ...prev]);
      onChange(`custom:${result.fileName}`);
    } else {
      alert(result.message || "上传失败");
    }
  };

  const handleDeleteCustom = async (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    if (!confirm("确定要删除这个图标吗？")) return;
    
    const result = await deleteIconAction(fileName);
    if (result.success) {
      setCustomIcons(prev => prev.filter(f => f !== fileName));
      if (value === `custom:${fileName}`) {
        onChange("Box");
      }
    } else {
      alert(result.message);
    }
  };

  const isCustom = value?.startsWith("custom:");
  const customFileName = isCustom ? value.split(":")[1] : "";

  const filteredIcons = iconList.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-12 h-10 p-0" title={value || "选择图标"}>
          <IconDisplay name={value} className="h-4 w-4 text-primary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] p-0 shadow-2xl border-border/50"
        align="start"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b bg-muted/20 space-y-3">
          <Input
            placeholder="搜索图标..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
              accept=".svg,.png,.jpg,.jpeg,.gif"
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full h-8 text-xs gap-1.5"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              上传图标
            </Button>
          </div>
        </div>
        <div
          className="h-[300px] overflow-y-auto p-2 custom-scrollbar"
          onWheel={(e) => {
            e.stopPropagation();
          }}
        >
          {customIcons.length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-2">自定义图标</p>
              <div className="grid grid-cols-5 gap-1">
                {customIcons.map((fileName) => (
                  <div key={fileName} className="relative group/item">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-lg transition-all",
                        value === `custom:${fileName}` ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10"
                      )}
                      onClick={() => {
                        onChange(`custom:${fileName}`);
                        setOpen(false);
                      }}
                    >
                      <img src={`/api/icons/${fileName}`} className="h-6 w-6 object-contain" alt="custom icon" />
                    </Button>
                    <button
                      onClick={(e) => handleDeleteCustom(e, fileName)}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-2">系统图标库</p>
          <div className="grid grid-cols-5 gap-1">
            {filteredIcons.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-lg transition-all",
                    value === item.name ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-primary/10 hover:text-primary"
                  )}
                  onClick={() => {
                    onChange(item.name);
                    setOpen(false);
                  }}
                  title={item.name}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function IconDisplay({ name, className }: { name: string; className?: string }) {
  if (!name) return <LucideIcons.Box className={className} />;
  
  if (name.startsWith("custom:")) {
    const fileName = name.split(":")[1];
    return <img src={`/api/icons/${fileName}`} className={cn("object-contain", className)} alt="icon" />;
  }

  // 确保从 LucideIcons 中正确获取图标组件
  const Icon = (LucideIcons as any)[name];
  if (Icon && typeof Icon === 'function') {
    return <Icon className={className} />;
  }

  // 如果找不到对应的图标，尝试在 iconList 中查找（以防名称不匹配）
  const found = iconList.find(i => i.name === name);
  if (found) {
    const ListIcon = found.icon;
    return <ListIcon className={className} />;
  }

  return <LucideIcons.Box className={className} />;
}