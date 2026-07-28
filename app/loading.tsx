import { AnchorFashionLogo } from "@/components/shared/logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
      <div className="w-[200px] sm:w-[260px] animate-pulse">
        <AnchorFashionLogo />
      </div>
      <p className="mt-8 text-xs font-semibold tracking-[0.3em] text-[#1A1A1A] uppercase animate-pulse">
        Loading Experience
      </p>
    </div>
  );
}
