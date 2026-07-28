import { Metadata } from 'next';
import { CustomerService } from '@/lib/services/customer.service';
import { ProfileEditor } from '@/components/customer/ProfileEditor';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Profile | Anchor Fashion',
  description: 'Manage your profile information.',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const customerService = new CustomerService();
  const profile = await customerService.getProfile(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>
      <ProfileEditor profile={profile} />
    </div>
  );
}
