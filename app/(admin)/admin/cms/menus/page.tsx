import React from "react";
import { getNavigation } from "@/actions/cms.actions";
import MenusManager from "./MenusManager";

export const metadata = {
  title: "Menu Manager | CMS",
};

export default async function MenuManagerPage() {
  const headerMenu = await getNavigation("header");
  const footerMenu = await getNavigation("footer");

  const menus = [
    ...(headerMenu
      ? [headerMenu]
      : [
          {
            id: "mock-1",
            name: "Main Header Navigation",
            location: "header",
            items: [],
            updated_at: new Date().toISOString(),
          },
        ]),
    ...(footerMenu
      ? [footerMenu]
      : [
          {
            id: "mock-2",
            name: "Footer Links",
            location: "footer",
            items: [],
            updated_at: new Date().toISOString(),
          },
        ]),
  ];

  return <MenusManager initialMenus={menus} />;
}
