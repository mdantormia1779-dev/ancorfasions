import { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
  title: "Create an account | Anchor Fashion",
  description: "Join Anchor Fashion to manage your orders, wishlist, and more.",
};

export default function RegisterPage() {
  return (
    <>
      <div className="mb-6 flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create an Account
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground/80">
          Enter your details below to create your Anchor Fashion account and get
          started.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 px-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
        >
          Sign in
        </Link>
      </p>

      <p className="mx-auto mt-4 max-w-sm px-8 text-center text-xs text-muted-foreground/70">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-medium underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
