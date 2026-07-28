import { Anchor, Wrench } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Under Maintenance | Anchor Fashion',
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background text-foreground">
      <Wrench className="h-16 w-16 text-primary mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold tracking-tight mb-4">Under Maintenance</h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        We are currently performing scheduled maintenance to improve our platform. We'll be back shortly. Thank you for your patience!
      </p>
    </div>
  );
}
