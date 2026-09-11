"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/use-cart-store";
import { logoutCartAction } from "@/lib/actions/cart.actions";

interface LogoutButtonProps {
  className?: string;
  hideText?: boolean;
}

export function LogoutButton({ className, hideText }: LogoutButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out. Please try again.");
      return;
    }
    try {
      await logoutCartAction();
    } catch (e) {
      console.error("Logout cart clean error:", e);
    }
    useCartStore.setState({ cart: null, error: null });
    toast.success("Logged out successfully.");
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      title={hideText ? "Log out" : undefined}
      className={cn(
        "flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700",
        !hideText && "space-x-3",
        className
      )}
    >
      <LogOut className="h-5 w-5 flex-shrink-0" />
      {!hideText && <span>Log out</span>}
    </button>
  );
}
