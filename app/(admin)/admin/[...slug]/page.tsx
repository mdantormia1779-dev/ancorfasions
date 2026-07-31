import { Metadata } from 'next';
import { Hammer } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Coming Soon | Anchor Fashion Admin',
};

export default function AdminPlaceholderPage({ params }: { params: { slug: string[] } }) {
  const path = params.slug.join('/');
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="bg-slate-100 p-4 rounded-full mb-6">
        <Hammer className="h-10 w-10 text-slate-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Under Construction</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        The <span className="font-semibold text-slate-700">/admin/{path}</span> page is currently being built. Check back later for updates.
      </p>
      <Link 
        href="/admin" 
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
