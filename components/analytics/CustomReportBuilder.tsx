"use client";

import { useEffect, useState } from "react";

export function CustomReportBuilder() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics/bi?type=custom-report")
      .then((res) => res.json())
      .then((json) => setReport(json))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Custom Report Builder</h2>
          <p className="text-sm text-gray-500 mt-1">Ad-hoc analysis and saved templates</p>
        </div>
        <button className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md transition-colors border border-blue-200">
          + New Report
        </button>
      </div>

      {/* Mock drag and drop interface area */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-sm text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer">
          <span className="text-xl mb-2">📊</span>
          <span className="font-medium">Drop Dimensions Here</span>
          <span className="text-xs mt-1 text-gray-400">e.g., Date, Region, Product</span>
        </div>
        <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-sm text-gray-500 hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer">
          <span className="text-xl mb-2">📈</span>
          <span className="font-medium">Drop Metrics Here</span>
          <span className="text-xs mt-1 text-gray-400">e.g., Sales, Orders, Conv. Rate</span>
        </div>
      </div>

      {report && (
        <div className="border border-gray-200 rounded-lg overflow-hidden mt-8 shadow-sm">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800">{report.reportName}</h3>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 bg-white border rounded text-gray-600 hover:bg-gray-50">Filter</button>
              <button className="text-xs px-2 py-1 bg-white border rounded text-gray-600 hover:bg-gray-50">Export</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  {report.columns.map((col: string, i: number) => (
                    <th key={i} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {report.rows.map((row: any[], i: number) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    {row.map((cell: any, j: number) => (
                      <td key={j} className={`px-6 py-4 whitespace-nowrap text-sm ${j === 0 ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {typeof cell === 'number' && j > 0 ? (j === 1 ? `৳${cell.toLocaleString()}` : cell.toLocaleString()) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
