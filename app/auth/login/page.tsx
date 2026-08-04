import { Metadata } from "next";
import Link from "next/link";
import { Anchor } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In | Anchor Fashion",
  description: "Sign in to your Anchor Fashion account.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <div className="w-16 h-16 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-center mb-6">
        <Anchor className="h-8 w-8 text-primary" />
      </div>

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
