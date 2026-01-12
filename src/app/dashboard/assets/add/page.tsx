import { getGroupsForAssetAdd } from "../actions";
import { AddAssetForm } from "./add-asset-form";

export default async function AddAssetPage() {
  const groups = await getGroupsForAssetAdd();

  return (
    <div className="max-w-2xl mx-auto">
      <AddAssetForm groups={groups} />
    </div>
  );
}