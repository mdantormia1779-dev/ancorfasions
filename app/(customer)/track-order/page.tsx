'use client';

import { useState } from 'react';
import { usePublicTracking } from '@/hooks/shipping/use-tracking';
import { CheckCircle2, Circle, Clock, Package, Truck, Home, XCircle, AlertTriangle } from 'lucide-react';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  created: <Package className="h-5 w-5" />,
  pickup_requested: <Clock className="h-5 w-5" />,
  pickup_confirmed: <Clock className="h-5 w-5" />,
  picked_up: <Package className="h-5 w-5" />,
  in_transit: <Truck className="h-5 w-5" />,
  hub_received: <Truck className="h-5 w-5" />,
  out_for_delivery: <Truck className="h-5 w-5" />,
  delivered: <Home className="h-5 w-5" />,
  delivery_failed: <AlertTriangle className="h-5 w-5" />,
  returned_to_origin: <XCircle className="h-5 w-5" />,
  cancelled: <XCircle className="h-5 w-5" />,
};

export default function TrackOrderPage() {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  const { data: timeline, isLoading, error } = usePublicTracking(query || undefined);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-4">
            <Truck className="h-4 w-4" />
            Real-time Tracking
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Order</h1>
          <p className="text-slate-300 text-lg mb-8">Enter your tracking number to see the latest delivery status</p>

          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter tracking number (e.g. SFT-1234567)"
              className="flex-1 px-4 py-3 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
            >
              Track
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 max-w-2xl py-12">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 text-slate-500 py-12">
            <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-slate-600 rounded-full" />
            Fetching tracking info…
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-600 font-medium">Tracking not found</p>
            <p className="text-red-400 text-sm mt-1">Please check your tracking number and try again.</p>
          </div>
        )}

        {timeline && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Tracking Number</p>
                  <p className="font-mono text-lg font-bold mt-0.5">{timeline.trackingNumber ?? query}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                    timeline.currentStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                    ['delivery_failed', 'returned_to_origin', 'cancelled'].includes(timeline.currentStatus) ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {timeline.currentStatus === 'delivered' && <CheckCircle2 className="h-4 w-4" />}
                    {timeline.currentStatus?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              {timeline.estimatedDelivery && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Estimated delivery: <strong>{new Date(timeline.estimatedDelivery).toLocaleDateString('en-BD', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                </div>
              )}
              <div className="mt-2 text-xs text-slate-400">
                via <span className="capitalize font-medium">{timeline.courierName}</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="font-semibold mb-6">Delivery Progress</h2>
              <div className="space-y-0">
                {timeline.events.map((event: any, index: number) => {
                  const isLast = index === timeline.events.length - 1;
                  return (
                    <div key={event.id} className="flex gap-4">
                      {/* Connector */}
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          event.isCompleted || event.isCurrent
                            ? event.isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-green-500 text-white'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {event.isCompleted && !event.isCurrent ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            STATUS_ICONS[event.status] ?? <Circle className="h-4 w-4" />
                          )}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 my-1 ${event.isCompleted ? 'bg-green-300' : 'bg-slate-100'}`} style={{ minHeight: '24px' }} />
                        )}
                      </div>

                      {/* Event Content */}
                      <div className={`pb-6 flex-1 ${isLast ? '' : ''}`}>
                        <p className={`font-medium ${event.isCurrent ? 'text-blue-700' : event.isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                          {event.statusLabel}
                        </p>
                        {event.description && (
                          <p className="text-sm text-slate-500 mt-0.5">{event.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          {event.location && <span className="text-xs text-slate-400">{event.location}</span>}
                          {event.timestamp && (
                            <span className="text-xs text-slate-400">
                              {new Date(event.timestamp).toLocaleDateString('en-BD', {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!query && !isLoading && (
          <div className="text-center py-12 text-slate-400">
            <Truck className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>Enter your tracking number above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
