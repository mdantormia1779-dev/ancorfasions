import { Metadata } from "next";
import { StoreSettingsClient } from "./store-client";
import { getStoreConfig } from "@/lib/actions/settings.actions";

export const metadata: Metadata = {
  title: "Store Settings | Admin",
};

export default async function StoreSettingsPage() {
  const storeConfig = await getStoreConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Configure your store's basic information and localization.
        </p>
      </div>

      <StoreSettingsClient initialConfig={storeConfig} />
    </div>
  );
}
