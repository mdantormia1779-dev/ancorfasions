import { RealTimeCommandCenter } from "@/components/analytics/RealTimeCommandCenter";
import { AiDecisionSupport } from "@/components/analytics/AiDecisionSupport";
import { CustomReportBuilder } from "@/components/analytics/CustomReportBuilder";

export default function AnalyticsDashboardPage() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Enterprise Analytics Hub</h1>
        <div className="space-x-4">
          <button className="px-4 py-2 bg-white border rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 transition-colors">
            Schedule Alert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Pulse Dashboard */}
        <div className="xl:col-span-2 space-y-8">
          <RealTimeCommandCenter />
          <CustomReportBuilder />
        </div>
        
        {/* Executive AI Sidebar */}
        <div className="xl:col-span-1">
          <AiDecisionSupport />
        </div>
      </div>
    </div>
  );
}
