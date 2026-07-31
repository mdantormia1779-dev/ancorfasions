import { AnchorFashionLogo } from "@/components/shared/logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="w-[200px] animate-pulse sm:w-[260px]">
        <AnchorFashionLogo />
      </div>
      <p className="mt-8 animate-pulse text-xs font-semibold uppercase tracking-[0.3em] text-[#1A1A1A]">
        Loading Experience
      </p>
    </div>
  );
}
