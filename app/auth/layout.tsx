import { Metadata } from "next";

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
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl bg-background border min-h-[650px] relative">
        {/* Left Side - Blue Panel */}
        <div className="relative hidden lg:flex flex-col justify-center items-center w-1/2 bg-primary p-12 text-primary-foreground overflow-hidden">
          {/* Decorative shapes */}
          {/* Top left shapes */}
          <div className="absolute top-8 left-8 flex gap-2">
            <div className="w-16 h-8 bg-white/10 rounded-full" />
            <div className="w-4 h-16 bg-white/10 rounded-full" />
            <div className="w-8 h-12 bg-white/10 rounded-full" />
          </div>
          <div className="absolute top-12 left-12 w-2 h-2 bg-white/80 rounded-full" />
          <div className="absolute top-16 left-32 w-1.5 h-1.5 bg-white/80 rounded-full" />
          <div className="absolute top-20 left-10 w-1.5 h-1.5 bg-white/40 rounded-full" />
          <div className="absolute top-[80px] left-36 w-6 h-6 border-2 border-white/20 rounded-full" />
          <div className="absolute top-24 left-[150px] w-2 h-2 bg-white/80 rounded-full" />

          {/* Dotted pattern top left */}
          <div className="absolute top-24 left-10 grid grid-cols-4 gap-1">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />
            ))}
          </div>

          {/* Text Content */}
          <div className="relative z-10 text-left w-full max-w-md mt-10">
            <h1 className="text-5xl font-bold mb-4 leading-tight">
              Anchor <br /> Fashion
            </h1>
            <p className="text-lg text-primary-foreground/80">
              The premier enterprise e-commerce<br />management platform.
            </p>
          </div>

          {/* Bottom left shapes */}
          <div className="absolute bottom-16 left-12 w-4 h-4 bg-accent rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          <div className="absolute bottom-20 left-32 text-white/30 text-2xl font-bold">×</div>
          <div className="absolute bottom-8 left-8 grid grid-cols-4 gap-1">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white/20 rounded-full" />
            ))}
          </div>

          {/* Bottom Right concentric circles */}
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full border-2 border-white/10" />
          <div className="absolute -bottom-8 -right-8 w-64 h-64 rounded-full border-2 border-white/10" />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-gradient-to-tr from-accent/20 to-primary/50" />
          <div className="absolute bottom-32 right-10 w-4 h-4 bg-accent rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-card">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
