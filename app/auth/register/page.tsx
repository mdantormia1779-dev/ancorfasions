import { Metadata } from "next";
import Link from "next/link";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create an account | Anchor Fashion",
  description: "Join Anchor Fashion to manage your orders, wishlist, and more.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <AnimatedLogo />

      <h1 className="text-2xl font-semibold mb-8 text-foreground">
        Create an Account
      </h1>

      <div className="w-full">
        <RegisterForm />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:underline font-medium"
        >
          Login
        </Link>
      </p>

      <p className="mx-auto mt-4 max-w-sm px-8 text-center text-xs text-muted-foreground/80">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="hover:text-foreground underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="hover:text-foreground underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
