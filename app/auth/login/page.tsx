import { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In | Anchor Fashion",
  description: "Sign in to your Anchor Fashion account.",
};

export default function LoginPage() {
  return (
    <>
      <div className="mb-8 flex flex-col space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Enter your email and password to sign in to your Anchor Fashion
          account.
        </p>
      </div>

      <LoginForm />

      <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-medium underline underline-offset-4 transition-colors hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
