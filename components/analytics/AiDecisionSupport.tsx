"use client";

import { useEffect, useState } from "react";

export function AiDecisionSupport() {
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics/ai-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: "daily-rollup" })
    })
      .then((res) => res.json())
      .then((json) => setInsights(json))
      .catch((err) => console.error(err));
  }, []);

  if (!insights) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6 h-[400px] flex flex-col justify-center items-center gap-4 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-blue-200"></div>
        <div className="h-4 bg-blue-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg shadow-md">
          ✨
        </div>
        <div>
          <h2 className="text-xl font-bold text-blue-900">Gemini Insights</h2>
          <p className="text-xs font-medium text-blue-700">Executive Briefing</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-lg p-5 border border-blue-100 shadow-sm">
        <p className="text-sm text-blue-950 leading-relaxed font-medium">
          {insights.summary}
        </p>
      </div>

      <div>
        <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500"></span> Identifed Risks
        </h3>
        <ul className="space-y-3">
          {insights.risks.map((risk: string, i: number) => (
            <li key={i} className="flex gap-3 text-sm text-red-900 items-start bg-red-50/50 p-3 rounded-md border border-red-100">
              <span className="text-red-500 mt-0.5">⚠️</span> 
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Recommended Actions
        </h3>
        <div className="space-y-3">
          {insights.recommendations.map((rec: any, i: number) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow">
              <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold rounded mb-2 tracking-wider">
                {rec.type}
              </span>
              <p className="text-sm text-gray-700 font-medium">{rec.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
