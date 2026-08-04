"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export function CustomerSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set("q", query);
        } else {
          params.delete("q");
        }
        router.push(`?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(handler);
  }, [query, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search customers by name or email..."
        className="w-full bg-background pl-8"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {isPending && (
        <div className="absolute right-3 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      )}
    </div>
  );
}
