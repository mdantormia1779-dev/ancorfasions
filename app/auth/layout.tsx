import { Metadata } from "next";
import Link from "next/link";
import { Anchor } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container relative grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0 bg-muted/20">
      <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-950" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="relative z-20 flex items-center text-xl font-bold tracking-tight">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <Anchor className="h-7 w-7" />
            Anchor Fashion
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-xl font-medium leading-relaxed max-w-lg">
              "This platform has completely transformed how we manage our supply
              chain and e-commerce operations. It is truly enterprise grade."
            </p>
            <footer className="text-sm font-medium text-primary-foreground/80 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                SD
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">Sofia Davis</span>
                <span>VP of Operations</span>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8 flex flex-col justify-center h-full">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-center mb-8 gap-2 font-bold text-xl text-primary">
          <Anchor className="h-6 w-6" />
          <span>Anchor Fashion</span>
        </div>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px] bg-background p-8 rounded-2xl shadow-sm border border-border/50">
          {children}
        </div>
      </div>
    </div>
  );
}
