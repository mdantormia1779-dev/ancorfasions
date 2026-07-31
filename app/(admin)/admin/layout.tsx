import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { createClient } from '@/lib/supabase/server';
import { ADMIN_ROLES } from '@/lib/constants/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Anchor Fashion',
  description: 'Enterprise Executive Command Center',
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Server-side auth guard — second layer of protection
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/admin');
  }

  const role = user.user_metadata?.role || user.app_metadata?.role || 'CUSTOMER';
  if (!ADMIN_ROLES.includes(role)) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
      <AdminSidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <AdminHeader user={user} role={role} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
