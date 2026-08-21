import { CatalogRepository } from "@/repositories/catalog.repository";
import { HomeHero } from "@/components/home/home-hero";
import { CategoryHighlight } from "@/components/home/category-highlight";
import { PremiumShades } from "@/components/home/premium-shades";
import { FeaturesBar } from "@/components/home/features-bar";
import { ExploreCollections } from "@/components/home/explore-collections";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { BrandedCollection } from "@/components/home/branded-collection";
import { SocialFeed } from "@/components/home/social-feed";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { PromoBanner } from "@/components/home/promo-banner";
import { TrendingProducts } from "@/components/home/trending-products";
import { Testimonials } from "@/components/home/testimonials";
import { TrustBar } from "@/components/home/trust-bar";
import { TrustStrip } from "@/components/home/trust-strip";
import { RecentlyViewedHome } from "@/components/home/recently-viewed-home";
import { PersonalizedSection } from "@/components/home/personalized-section";
import { getHeroSlides } from "@/actions/cms.actions";
import { FadeIn } from "@/components/ui/fade-in";

export const metadata = {
  title: "Home | Anchor Fashion Enterprise",
  description:
    "Discover premium apparel for the modern professional at Anchor Fashion.",
};

export default async function HomePage() {
  // Fetch dynamic data from the database
  const [
    categories,
    mensProducts,
    womensProducts,
    kidsProducts,
    accessoriesProducts,
    featuredProducts,
    trendingProducts,
    heroSlides,
  ] = await Promise.all([
    CatalogRepository.getCategories(),
    CatalogRepository.getProducts({ category: "mens", limit: 8 }),
    CatalogRepository.getProducts({ category: "womens", limit: 8 }),
    CatalogRepository.getProducts({ category: "kids", limit: 4 }),
    CatalogRepository.getProducts({ category: "accessories", limit: 4 }),
    CatalogRepository.getFeaturedProducts(4),
    CatalogRepository.getProducts({ sortBy: "rating", limit: 8 }),
    getHeroSlides(),
  ]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FAFAFA]">
      {/* 1. Immersive Hero Banner */}
      <HomeHero slides={heroSlides} />

      {/* 2. Trust Strip (Premium E-commerce) */}
      <TrustStrip />

      {/* 3. Features Bar */}
      <FadeIn delay={0.1} direction="none">
        <FeaturesBar />
      </FadeIn>

      {/* 3. Category Highlight Grid */}
      <FadeIn delay={0.2} direction="up">
        <CategoryHighlight />
      </FadeIn>

      {/* 4. Premium Category Shades */}
      <FadeIn direction="up">
        <PremiumShades />
      </FadeIn>

      <div className="space-y-16 py-10 md:space-y-48 md:py-32 lg:py-40">
        {/* 5. The Collection Grid */}
        <FadeIn>
          <ExploreCollections categories={categories} />
        </FadeIn>

        {/* Mens Collection */}
        <FadeIn>
          <BrandedCollection 
            products={mensProducts.data} 
            title="Mens Collection"
            subtitle="Mens"
            viewAllLink="/categories/mens"
          />
        </FadeIn>

        {/* 6. Womens Collection */}
        <FadeIn>
          <BrandedCollection 
            products={womensProducts.data}
            title="Womens Collection"
            subtitle="Womens"
            viewAllLink="/categories/womens"
          />
        </FadeIn>

        {/* 6.5 Recently Viewed (Client Side Personalization) */}
        <FadeIn>
          <RecentlyViewedHome />
        </FadeIn>

        <FadeIn>
          <PersonalizedSection 
            title="Kids" 
            subtitle="Curated for the little ones" 
            products={kidsProducts.data} 
            viewAllLink="/categories/kids"
          />
        </FadeIn>

        <FadeIn>
          <PersonalizedSection 
            title="Accessories" 
            subtitle="The final touch" 
            products={accessoriesProducts.data} 
            viewAllLink="/categories/accessories"
          />
        </FadeIn>

        {/* 7. Mid-Season Promo Banner */}
        <FadeIn direction="left">
          <PromoBanner
            title="Mid-Season Sale Up To 50% Off"
            subtitle="Limited Time Offer"
            ctaText="Shop The Sale"
            ctaLink="/categories/sale"
            imageUrl="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80"
          />
        </FadeIn>

        {/* 8. Trending Products */}
        <FadeIn>
          <TrendingProducts products={trendingProducts.data || []} />
        </FadeIn>

        <FadeIn>
          <PersonalizedSection title="Trending Near You" subtitle="Popular in your region" products={featuredProducts} />
        </FadeIn>

        <FadeIn>
          <PersonalizedSection title="Customers Love" subtitle="Highest rated pieces" products={trendingProducts.data?.slice(4, 8) || []} />
        </FadeIn>

        {/* 9. Brand Ethos / Story */}
        <FadeIn direction="right">
          <WhyChooseUs />
        </FadeIn>

        {/* 10. Featured Products */}
        <FadeIn>
          <FeaturedProducts products={featuredProducts} />
        </FadeIn>

        {/* 11. Trust Bar */}
        <FadeIn direction="up">
          <TrustBar />
        </FadeIn>
      </div>

      {/* 12. Testimonials — Dark Section */}
      <FadeIn direction="none">
        <Testimonials />
      </FadeIn>

      {/* 13. Social Feed */}
      <FadeIn>
        <SocialFeed />
      </FadeIn>

      {/* 14. Newsletter */}
      <FadeIn direction="none">
        <NewsletterSection />
      </FadeIn>
    </div>
  );
}
