import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnalyticsFilters } from '@/features/analytics/components/AnalyticsFilters';
import { FileText, Download, Printer } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reports | Anchor Fashion',
};

export default function ReportsPage() {
  const reports = [
    { id: 'sales', name: 'Sales Report', description: 'Comprehensive breakdown of all sales within the selected period.', format: 'CSV / Excel' },
    { id: 'inventory', name: 'Inventory Report', description: 'Current stock levels, low stock alerts, and value.', format: 'CSV / Excel' },
    { id: 'customer', name: 'Customer Report', description: 'Detailed list of new and returning customers.', format: 'CSV' },
    { id: 'order', name: 'Order Fulfillment Report', description: 'Status of all orders and processing times.', format: 'CSV / Excel' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custom Reports</h1>
        <p className="text-muted-foreground">
          Generate, export, and print customized business reports.
        </p>
      </div>
      
      <AnalyticsFilters showExport={false} />

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </div>
              <div className="p-2 bg-primary/10 text-primary rounded-md">
                <FileText className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-4">
                <Button variant="default" size="sm" className="gap-2">
                  <Download className="h-4 w-4" /> Export {report.format.split('/')[0].trim()}
                </Button>
                {report.format.includes('Excel') && (
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export Excel
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" /> Print
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
