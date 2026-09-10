"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { exportToCsv } from "@/lib/analytics/export-utils";
import { Download, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ReportBuilderPage() {
  const [reportName, setReportName] = useState("");
  const [dimensions, setDimensions] = useState<string[]>(["date"]);
  const [metrics, setMetrics] = useState<string[]>(["sales"]);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);

  const toggleDimension = (dim: string) => {
    setDimensions((prev) =>
      prev.includes(dim) ? prev.filter((d) => d !== dim) : [...prev, dim]
    );
  };

  const toggleMetric = (met: string) => {
    setMetrics((prev) =>
      prev.includes(met) ? prev.filter((m) => m !== met) : [...prev, met]
    );
  };

  const handleExport = () => {
    if (!reportName) {
      toast.error("Please enter a report name");
      return;
    }
    if (previewData.length === 0) {
      toast.error("No data available to export for this report");
      return;
    }
    exportToCsv(
      previewData,
      `${reportName.replace(/\s+/g, "_").toLowerCase()}.csv`
    );
    toast.success("Report exported successfully");
  };

  const handleSave = () => {
    if (!reportName) {
      toast.error("Please enter a report name to save");
      return;
    }
    // In a real app, this would hit an API to save to custom_reports_config table
    toast.success("Report configuration saved!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Custom Report Builder
        </h1>
        <p className="text-muted-foreground">
          Design, preview, and export custom enterprise reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Configuration Panel */}
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select dimensions and metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                placeholder="e.g., Weekly Category Sales"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Dimensions (Rows)</h4>
              <div className="flex flex-col space-y-2">
                {["Date", "Category", "Brand", "Region", "Device"].map(
                  (dim) => (
                    <div key={dim} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dim-${dim}`}
                        checked={dimensions.includes(dim.toLowerCase())}
                        onCheckedChange={() =>
                          toggleDimension(dim.toLowerCase())
                        }
                      />
                      <Label
                        htmlFor={`dim-${dim}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {dim}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Metrics (Columns)</h4>
              <div className="flex flex-col space-y-2">
                {["Sales", "Orders", "Units", "Refunds", "Profit"].map(
                  (met) => (
                    <div key={met} className="flex items-center space-x-2">
                      <Checkbox
                        id={`met-${met}`}
                        checked={metrics.includes(met.toLowerCase())}
                        onCheckedChange={() => toggleMetric(met.toLowerCase())}
                      />
                      <Label
                        htmlFor={`met-${met}`}
                        className="cursor-pointer text-sm font-normal"
                      >
                        {met}
                      </Label>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Date Range</h4>
              <Select defaultValue="7d">
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="flex flex-col md:col-span-8">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Live preview of the first 100 rows.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Report
              </Button>
              <Button size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted text-muted-foreground">
                  <tr>
                    {dimensions.map((d) => (
                      <th key={d} className="px-4 py-3 font-medium capitalize">
                        {d}
                      </th>
                    ))}
                    {metrics.map((m) => (
                      <th key={m} className="px-4 py-3 font-medium capitalize">
                        {m}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={dimensions.length + metrics.length}
                        className="py-12 text-center text-muted-foreground"
                      >
                        No data found for the selected dimensions and date range.
                      </td>
                    </tr>
                  ) : (
                    previewData.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b transition-colors last:border-0 hover:bg-muted/50"
                      >
                        {dimensions.map((d) => (
                          <td key={d} className="px-4 py-3">
                            {(row as any)[d] || "-"}
                          </td>
                        ))}
                        {metrics.map((m) => (
                          <td key={m} className="px-4 py-3">
                            {m === "sales" || m === "profit" || m === "refunds"
                              ? `$${(row as any)[m] || 0}`
                              : (row as any)[m] || 0}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
