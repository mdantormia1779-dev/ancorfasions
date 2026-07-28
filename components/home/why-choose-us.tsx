import { ShieldCheck, Truck, RefreshCcw, HeartHandshake } from "lucide-react";
import Image from "next/image";
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });

export function WhyChooseUs() {
  const benefits = [
    {
      icon: <ShieldCheck className="w-6 h-6 stroke-[1.5]" />,
      title: "Premium Quality",
      description: "Crafted with the finest materials to ensure durability, comfort, and a flawless look."
    },
    {
      icon: <Truck className="w-6 h-6 stroke-[1.5]" />,
      title: "Fast & Free Shipping",
      description: "Enjoy complimentary express shipping on all orders over ৳999 across the country."
    },
    {
      icon: <RefreshCcw className="w-6 h-6 stroke-[1.5]" />,
      title: "Hassle-Free Returns",
      description: "Not the right fit? Return or exchange within 14 days with zero questions asked."
    },
    {
      icon: <HeartHandshake className="w-6 h-6 stroke-[1.5]" />,
      title: "Ethical Fashion",
      description: "We are committed to sustainable practices and fair wages throughout our supply chain."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Side: Brand Image / Ethos */}
          <div className="relative h-[500px] lg:h-[700px] w-full overflow-hidden">
            <Image 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80" 
              alt="The Anchor Fashion Difference" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-10 left-10 right-10 bg-white/95 backdrop-blur-sm p-8 text-center">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#C9A86A] uppercase mb-3 block">
                Our Ethos
              </span>
              <h2 className={`${jost.className} text-3xl font-light tracking-tight text-gray-900 mb-4`}>
                The Anchor Fashion Difference
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We don&apos;t just sell clothes; we provide an elevated lifestyle experience. 
                Discover why thousands of customers choose us for their everyday elegance.
              </p>
            </div>
          </div>

          {/* Right Side: Features */}
          <div className="flex flex-col gap-10">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 h-14 border border-gray-200 flex items-center justify-center text-[#C9A86A] group-hover:border-[#C9A86A] group-hover:bg-[#C9A86A]/5 transition-all duration-300">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className={`${jost.className} text-xl font-medium text-[#1A1A1A] mb-2`}>{benefit.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-md">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
}
