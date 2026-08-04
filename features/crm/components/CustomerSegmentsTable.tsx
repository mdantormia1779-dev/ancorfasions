import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SegmentStat {
  stage: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

interface CustomerSegmentsTableProps {
  segments?: SegmentStat[];
}

export const CustomerSegmentsTable = ({
  segments = [],
}: CustomerSegmentsTableProps) => {
  return (
    <div className="rounded-md border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lifecycle Stage</TableHead>
              <TableHead className="text-right">Total Customers</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
              <TableHead className="text-right">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {segments.map((segment) => (
              <TableRow key={segment.stage}>
                <TableCell className="font-medium">
                  <Badge variant="outline" className="capitalize">
                    {segment.stage.replace(/_/g, " ").toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {segment.count.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${segment.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm">{segment.percentage}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {segment.trend === "up" && (
                    <span className="font-bold text-green-500">↑</span>
                  )}
                  {segment.trend === "down" && (
                    <span className="font-bold text-red-500">↓</span>
                  )}
                  {segment.trend === "stable" && (
                    <span className="font-bold text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
