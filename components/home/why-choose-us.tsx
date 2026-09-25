import { ShieldCheck, Truck, RefreshCcw, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { jost } from "@/lib/fonts";

export function WhyChooseUs() {
  const benefits = [
    {
      icon: <ShieldCheck className="h-6 w-6 stroke-[1.5]" />,
      title: "Premium Quality",
      description:
        "Crafted with the finest materials to ensure durability, comfort, and a flawless look.",
    },
    {
      icon: <Truck className="h-6 w-6 stroke-[1.5]" />,
      title: "Fast & Free Shipping",
      description:
        "Enjoy complimentary express shipping on all orders over ৳999 across the country.",
    },
    {
      icon: <RefreshCcw className="h-6 w-6 stroke-[1.5]" />,
      title: "Hassle-Free Returns",
      description:
        "Not the right fit? Return or exchange within 14 days with zero questions asked.",
    },
    {
      icon: <HeartHandshake className="h-6 w-6 stroke-[1.5]" />,
      title: "Ethical Fashion",
      description:
        "We are committed to sustainable practices and fair wages throughout our supply chain.",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left Side: Brand Image / Ethos */}
          <div className="relative aspect-[3/4] h-auto w-full overflow-hidden md:h-[500px] md:aspect-auto lg:h-[700px]">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
              alt="The Anchor Fashion Difference"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 p-6 text-center backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 md:bottom-10 md:left-10 md:right-10 md:p-8">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A86A]">
                Our Ethos
              </span>
              <h2
                className={`${jost.className} mb-4 text-2xl font-light tracking-tight text-gray-900 md:text-3xl`}
              >
                The Anchor Fashion Difference
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                We don&apos;t just sell clothes; we provide an elevated
                lifestyle experience. Discover why thousands of customers choose
                us for their everyday elegance.
              </p>
            </div>
          </div>

          {/* Right Side: Features */}
          <div className="flex flex-col gap-10">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="group flex gap-6">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center border border-gray-200 text-[#C9A86A] transition-all duration-300 group-hover:border-[#C9A86A] group-hover:bg-[#C9A86A]/5">
                  {benefit.icon}
                </div>
                <div>
                  <h3
                    className={`${jost.className} mb-2 text-xl font-medium text-[#1A1A1A]`}
                  >
                    {benefit.title}
                  </h3>
                  <p className="max-w-md text-sm leading-relaxed text-gray-500">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
