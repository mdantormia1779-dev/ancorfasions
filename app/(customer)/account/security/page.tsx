import { Metadata } from 'next';
import { ChangePassword } from '@/components/customer/ChangePassword';

export const metadata: Metadata = {
  title: 'Security | Anchor Fashion',
  description: 'Manage your account security.',
};

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Security</h1>
        <p className="text-muted-foreground">Manage your password and security preferences.</p>
      </div>
      <ChangePassword />
    </div>
  );
}
