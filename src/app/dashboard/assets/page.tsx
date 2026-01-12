import { getAssets } from "./actions";
import { AssetList } from "./asset-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AssetsPage() {
  const assets = await getAssets();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">查看和管理您的所有网络资产</p>
        <Link href="/dashboard/assets/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加资产
          </Button>
        </Link>
      </div>
      <AssetList initialAssets={assets} />
    </div>
  );
}