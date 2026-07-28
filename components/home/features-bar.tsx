import { Truck, RotateCcw, Award, ShieldCheck } from "lucide-react";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"] });

const features = [
  {
    icon: Truck,
    title: "Free Delivery",
    description: "Orders over ৳999",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "7-day free returns",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description: "Finest materials only",
  },
  {
    icon: ShieldCheck,
    title: "Secure Checkout",
    description: "100% safe & encrypted",
  },
];

export function FeaturesBar() {
  return (
    <section className={`${jost.className} bg-white border-b border-gray-100`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center justify-center gap-3 px-4 md:px-8 py-6 group hover:bg-[#C9A86A]/5 transition-colors duration-300"
              >
                <div className="w-10 h-10 flex items-center justify-center border border-[#C9A86A]/30 group-hover:border-[#C9A86A] group-hover:bg-[#C9A86A]/10 transition-all duration-300 flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#C9A86A]" strokeWidth={1.5} />
                </div>
                <div className="text-center md:text-left">
                  <span className="font-semibold text-xs tracking-wider uppercase text-[#1A1A1A] block">{feature.title}</span>
                  <span className="text-[11px] text-gray-400 font-light">{feature.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
