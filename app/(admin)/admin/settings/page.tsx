import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Globe, 
  CreditCard, 
  Truck, 
  Mail, 
  ShieldCheck, 
  Key,
  Layout,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Business Settings | Anchor Fashion',
  description: 'Enterprise Configuration',
};

const settingsSections = [
  {
    title: 'General Store Info',
    description: 'Store name, phone, email, address, announcement bar, and social links.',
    href: '/admin/settings/general',
    icon: Building,
    badge: 'Live',
  },
  {
    title: 'Payment Gateways',
    description: 'Configure bKash, SSLCommerz credentials and enable/disable payment methods.',
    href: '/admin/payments/providers',
    icon: CreditCard,
    badge: 'Live',
  },
  {
    title: 'Website & SEO',
    description: 'Manage meta tags, structured data, sitemaps, and redirects.',
    href: '/admin/cms/seo',
    icon: Globe,
  },
  {
    title: 'Courier Integration',
    description: 'Configure Pathao, Steadfast, and other shipping providers.',
    href: '/admin/shipping',
    icon: Truck,
  },
  {
    title: 'Email Configuration',
    description: 'Resend API key, email templates, and notification preferences.',
    href: '/admin/notifications',
    icon: Mail,
  },
  {
    title: 'Security Policies',
    description: 'Password policies, login audit logs, and session management.',
    href: '/admin/security',
    icon: ShieldCheck,
  },
  {
    title: 'API Keys',
    description: 'Manage external API keys and integrations.',
    href: '/admin/settings/api-keys',
    icon: Key,
  },
  {
    title: 'Hero Banners & CMS',
    description: 'Manage homepage hero slides, promotions and content pages.',
    href: '/admin/cms/banners',
    icon: Layout,
    badge: 'Live',
  },
];

export default function BusinessSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage global enterprise configuration and integrations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-3">
                    <section.icon className="w-5 h-5" />
                  </div>
                  {section.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                      {section.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <CardDescription className="text-sm">{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
