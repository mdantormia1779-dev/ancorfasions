import { Metadata } from 'next';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Secure Checkout | Anchor Fashion',
  description: 'Complete your purchase securely.',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            ANCHOR<span className="text-primary">.</span>
          </Link>
          <div className="flex items-center text-sm text-slate-500 font-medium">
            <Lock className="w-4 h-4 mr-2 text-green-600" />
            Secure Checkout
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-6 mt-12 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Anchor Fashion Enterprise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
