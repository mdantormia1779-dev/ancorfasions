import { Metadata } from 'next';
import { Download, Printer, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Reports & Exports | Anchor Fashion Analytics',
  description: 'Generate and export custom BI reports',
};

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
          <p className="text-muted-foreground">
            Generate, print, and export CSV/Excel reports.
          </p>
        </div>
      </div>
      
      <AnalyticsFilters />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Sales & Revenue Report
            </CardTitle>
            <CardDescription>Comprehensive daily breakdown of all sales</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Includes dates, gross revenue, net profit, total orders, and average order values.</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Customer Segment Report
            </CardTitle>
            <CardDescription>Export customer profiles & LTV data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Includes emails, registration dates, total spend, and marketing opt-ins.</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Inventory Valuation Report
            </CardTitle>
            <CardDescription>Current stock levels and value</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Includes SKUs, quantities, low stock alerts, and COGS estimations.</p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" size="sm" className="w-full">
              <Download className="w-4 h-4 mr-2" /> CSV
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
