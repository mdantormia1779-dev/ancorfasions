import { Metadata } from "next";
import { getHeroSlides } from "@/lib/actions/cms.actions";
import { BannersManager } from "./BannersManager";

export const metadata: Metadata = {
  title: "Hero Banners | CMS Admin",
};

export const revalidate = 0;

export default async function BannersPage() {
  const slides = await getHeroSlides();
  return <BannersManager initialSlides={slides} />;
}
