"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }

    toast.success("Successfully logged in!");

    // Role-based redirect after login
    let role =
      data.user?.user_metadata?.role ||
      data.user?.app_metadata?.role;

    // Fallback role resolution from profiles table if metadata pending
    if (!role && data.user?.id) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("roles(name)")
          .eq("id", data.user.id)
          .single();
        role = (profile?.roles as any)?.name;
      } catch {
        role = "CUSTOMER";
      }
    }
    if (!role) role = "CUSTOMER";

    const ADMIN_ROLES = ["SUPERADMIN", "ADMIN"];
    const MANAGER_ROLES = [
      "MANAGER",
      "WAREHOUSE_MANAGER",
      "FINANCE_MANAGER",
    ];
    const MARKETING_ROLES = ["MARKETING", "MARKETING_MANAGER"];
    const STAFF_ROLES = ["STAFF", "SUPPORT"];

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    if (next) {
      router.push(next);
    } else if (ADMIN_ROLES.includes(role)) {
      router.push("/admin");
    } else if (MARKETING_ROLES.includes(role)) {
      router.push("/admin/marketing");
    } else if (MANAGER_ROLES.includes(role)) {
      router.push("/manager");
    } else if (STAFF_ROLES.includes(role)) {
      router.push("/admin");
    } else {
      router.push("/account/profile");
    }

    router.refresh();
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 font-semibold text-sm">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <Input
                      placeholder="Enter your email address"
                      className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/30 placeholder:text-slate-400"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 font-semibold text-sm">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0110 0v4"></path>
                    </svg>
                    <PasswordInput
                      placeholder="••••••••••••"
                      className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/30 placeholder:text-slate-400"
                      {...field}
                      disabled={isLoading}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
              />
              <label htmlFor="remember" className="text-sm text-slate-600 font-medium">
                Remember me
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Reset Password!
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all rounded-lg mt-6 font-semibold" 
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-slate-400">or</span>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="w-14 h-14 rounded-xl border-slate-200 shadow-sm transition-all hover:bg-slate-50"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="w-14 h-14 rounded-xl border-slate-200 shadow-sm transition-all hover:bg-slate-50"
        >
          <svg className="h-6 w-6 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
