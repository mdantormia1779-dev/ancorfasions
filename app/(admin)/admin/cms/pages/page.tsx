import React from "react";
import { getPages } from "@/actions/cms.actions";
import { CmsPagesClient } from "@/features/admin/components/cms/CmsPagesClient";

export const metadata = {
  title: "Page Manager | CMS",
};

export default async function PageManager() {
  const pages = await getPages();

  return <CmsPagesClient pages={pages} />;
}
