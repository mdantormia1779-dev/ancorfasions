import { Metadata } from "next";
import Link from "next/link";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In | Anchor Fashion",
  description: "Sign in to your Anchor Fashion account.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <AnimatedLogo />

      <h1 className="text-2xl font-semibold mb-8 text-foreground">
        Hello ! Welcome back
      </h1>

      <div className="w-full">
        <LoginForm />
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Dont Have an account?{" "}
        <Link
          href="/auth/register"
          className="text-primary hover:underline font-medium"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}
