import React from "react";
import { getPages, getPageBlocks } from "@/actions/cms.actions";
import { notFound } from "next/navigation";
import { VisualBuilder } from "@/features/admin/components/cms/VisualBuilder";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const pages = await getPages();
  const page = pages.find((p) => p.id === id);

  if (!page) {
    return notFound();
  }

  const initialBlocks = await getPageBlocks(id);

  return (
    <VisualBuilder 
      page={page} 
      initialBlocks={initialBlocks} 
    />
  );
}
