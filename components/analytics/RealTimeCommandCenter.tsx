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
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse h-[200px] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Real-Time Command Center</h2>
          <p className="text-sm text-gray-500 mt-1">Live pulse of Anchor Fashion operations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-medium text-green-700">Live</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="p-6 hover:bg-gray-50 transition-colors">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Today's Revenue</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">৳{data.today.revenue.toLocaleString()}</span>
            <span className={`text-sm font-bold ${data.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth.revenue >= 0 ? '+' : ''}{data.growth.revenue}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs yesterday</p>
        </div>
        
        <div className="p-6 hover:bg-gray-50 transition-colors">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Orders</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{data.today.orders.toLocaleString()}</span>
            <span className={`text-sm font-bold ${data.growth.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth.orders >= 0 ? '+' : ''}{data.growth.orders}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs yesterday</p>
        </div>
        
        <div className="p-6 hover:bg-gray-50 transition-colors">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Visitors</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{data.today.visitors.toLocaleString()}</span>
            <span className={`text-sm font-bold ${data.growth.visitors >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.growth.visitors >= 0 ? '+' : ''}{data.growth.visitors}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">vs yesterday</p>
        </div>
      </div>
    </div>
  );
}
