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
      <div className="mb-6 flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground/80">
          Enter your email and password to sign in to your Anchor Fashion
          account.
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
