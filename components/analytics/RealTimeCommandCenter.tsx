"use client";

import { useEffect, useState } from "react";

export function RealTimeCommandCenter() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics/bi?type=sales-rollup")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return (
      <div className="flex h-[200px] animate-pulse items-center justify-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 p-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Real-Time Command Center
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Live pulse of Anchor Fashion operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-green-700">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="p-6 transition-colors hover:bg-gray-50">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Today's Revenue
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              ৳{data.today.revenue.toLocaleString()}
            </span>
            <span
              className={`text-sm font-bold ${data.growth.revenue >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {data.growth.revenue >= 0 ? "+" : ""}
              {data.growth.revenue}%
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">vs yesterday</p>
        </div>

        <div className="p-6 transition-colors hover:bg-gray-50">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Live Orders
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {data.today.orders.toLocaleString()}
            </span>
            <span
              className={`text-sm font-bold ${data.growth.orders >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {data.growth.orders >= 0 ? "+" : ""}
              {data.growth.orders}%
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">vs yesterday</p>
        </div>

        <div className="p-6 transition-colors hover:bg-gray-50">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Active Visitors
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {data.today.visitors.toLocaleString()}
            </span>
            <span
              className={`text-sm font-bold ${data.growth.visitors >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {data.growth.visitors >= 0 ? "+" : ""}
              {data.growth.visitors}%
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-400">vs yesterday</p>
        </div>
      </div>
    </div>
  );
}
