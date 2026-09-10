import React from "react";
import { getAllNavigations, saveNavigation } from "@/actions/cms.actions";
import MenusManager from "./MenusManager";

export const metadata = {
  title: "Menu Manager | CMS",
  description: "Configure store navigation, header, footer, and category links.",
};

export const dynamic = "force-dynamic";

export default async function MenuManagerPage() {
  let menus = await getAllNavigations();

  // If database has no menus yet, automatically initialize default header and footer in database
  if (!menus || menus.length === 0) {
    try {
      const defaultHeader = await saveNavigation("header", "Main Header Navigation", [
        { label: "Home", url: "/" },
        { label: "Products", url: "/products" },
        { label: "Categories", url: "/categories" },
        { label: "About", url: "/about" },
      ]);
      const defaultFooter = await saveNavigation("footer", "Footer Links", [
        { label: "Terms & Conditions", url: "/terms" },
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Contact Us", url: "/contact" },
      ]);
      menus = [defaultHeader, defaultFooter];
    } catch (e) {
      console.error("Error seeding initial menus:", e);
    }
  }

  return <MenusManager initialMenus={menus} />;
}
