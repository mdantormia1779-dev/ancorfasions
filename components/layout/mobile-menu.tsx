"use client";

import Link from "next/link";
import { Menu, Search, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden -ml-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-sm flex flex-col p-0">
        <SheetHeader className="p-4 border-b flex flex-row justify-between items-center bg-primary text-primary-foreground">
          <SheetTitle className="text-primary-foreground font-bold tracking-tight uppercase">
            Anchor Fashion
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Search */}
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-9 pr-4 py-2 bg-muted rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col">
            <Link href="/products?sort=newest" className="flex items-center justify-between p-4 border-b font-medium">
              New In
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/categories/women" className="flex items-center justify-between p-4 border-b font-medium">
              Women
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/categories/men" className="flex items-center justify-between p-4 border-b font-medium">
              Men
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/categories/accessories" className="flex items-center justify-between p-4 border-b font-medium">
              Accessories
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/categories/sale" className="flex items-center justify-between p-4 border-b font-medium text-destructive">
              Sale
              <ChevronRight className="h-4 w-4 text-destructive/70" />
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/account/profile" className="font-medium hover:underline">My Account</Link>
            <Link href="/track-order" className="font-medium hover:underline">Track Order</Link>
            <Link href="/contact" className="font-medium hover:underline">Support</Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
