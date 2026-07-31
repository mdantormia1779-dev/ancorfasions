import { Card, CardContent } from "@/components/ui/card";
import { StoreHeader } from "@/components/layout/store-header";
import { StoreFooter } from "@/components/layout/store-footer";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="bg-slate-50 px-4 py-20 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              About Anchor Fashion
            </h1>
            <p className="text-lg text-slate-600">
              We believe in creating timeless pieces that blend classic elegance
              with modern trends. Our mission is to empower individuals to
              express their unique style with confidence and comfort.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="px-4 py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Our Story
              </h2>
              <p className="leading-relaxed text-slate-600">
                Founded in 2024, Anchor Fashion started as a small boutique with
                a big dream: to redefine premium fashion without the premium
                markup. We source the finest materials from around the world and
                partner with skilled artisans to bring our designs to life.
              </p>
              <p className="leading-relaxed text-slate-600">
                Every piece in our collection is carefully curated to ensure it
                meets our strict standards for quality, sustainability, and
                style. We are more than just a clothing brand; we are a
                community of fashion enthusiasts who appreciate the finer things
                in life.
              </p>
            </div>
            <div className="flex h-[400px] items-center justify-center overflow-hidden rounded-lg bg-slate-200">
              {/* Placeholder for an image */}
              <span className="font-medium text-slate-400">
                Brand Image Placeholder
              </span>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-slate-50 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900">
              Our Core Values
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="border-none bg-white shadow-md">
                <CardContent className="space-y-4 pt-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    1
                  </div>
                  <h3 className="text-xl font-bold">Quality First</h3>
                  <p className="text-slate-600">
                    We never compromise on the quality of our fabrics or our
                    craftsmanship.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-white shadow-md">
                <CardContent className="space-y-4 pt-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    2
                  </div>
                  <h3 className="text-xl font-bold">Sustainability</h3>
                  <p className="text-slate-600">
                    Committed to ethical sourcing and reducing our environmental
                    footprint.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-white shadow-md">
                <CardContent className="space-y-4 pt-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    3
                  </div>
                  <h3 className="text-xl font-bold">Customer Focus</h3>
                  <p className="text-slate-600">
                    Your satisfaction is our ultimate priority. We are here to
                    serve you.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <StoreFooter />
    </div>
  );
}
