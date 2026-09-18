import { getAdminHeroSlides } from "@/actions/cms.actions";
import { BannersManager } from "./BannersManager";

export const metadata = {
  title: "Hero Banners | CMS | Anchor Fashion Enterprise",
};

export default async function BannersPage() {
  const slides = await getAdminHeroSlides();

  return (
    <div className="p-8 pt-6">
      <BannersManager initialSlides={slides} />
    </div>
  );
}