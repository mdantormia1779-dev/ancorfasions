import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { 
  User, Shield, ShoppingBag, Heart, 
  Award, Wallet, Ticket, Star, Bell 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const navItems = [
    { label: 'Overview', href: '/account', icon: User },
    { label: 'Profile Management', href: '/account/profile', icon: User },
    { label: 'Account Security', href: '/account/security', icon: Shield },
    { label: 'Order History', href: '/account/orders', icon: ShoppingBag },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Loyalty Program', href: '/account/loyalty', icon: Award },
    { label: 'Customer Wallet', href: '/account/wallet', icon: Wallet },
    { label: 'Coupons & Offers', href: '/account/coupons', icon: Ticket },
    { label: 'Reviews & Ratings', href: '/account/reviews', icon: Star },
    { label: 'Notifications', href: '/account/notifications', icon: Bell },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-muted text-sm font-medium transition-colors"
              >
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        
        <main className="flex-1 bg-card rounded-xl border shadow-sm overflow-hidden p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
