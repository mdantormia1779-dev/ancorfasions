import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In | Anchor Fashion",
  description: "Sign in to your Anchor Fashion account.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Logo */}
      <div className="mb-6">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Anchor Fashion"
            width={200}
            height={60}
            style={{ width: "auto", height: "auto" }}
            className="max-w-[200px]"
            priority
          />
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-8 text-slate-900 dark:text-slate-100">
        Hello ! Welcome back
      </h1>

      <div className="w-full">
        <LoginForm />
      </div>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Dont Have an account?{" "}
        <Link
          href="/auth/register"
          prefetch={false}
          className="text-[#C9A86A] hover:underline font-semibold"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}
