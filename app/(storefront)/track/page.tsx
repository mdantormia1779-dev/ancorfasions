'use client';

import { useState } from 'react';
import { Search, Package, MapPin, Calendar, Clock, CheckCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function TrackShipmentPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsLoading(true);
    setError('');
    setTrackingData(null);

    try {
      // Typically we'd have a /api/shipping/track endpoint, but for MVP we mock the response.
      // In a real app we'd do: const res = await fetch(`/api/shipping/track?number=${trackingNumber}`);
      
      // Simulate network
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock Data based on the MVP placeholder requirement
      setTrackingData({
        trackingNumber: trackingNumber,
        status: 'in_transit', // Example status
        courier: 'Steadfast',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // +2 days
        events: [
          {
            status: 'Picked Up',
            location: 'Dhaka Warehouse',
            time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // -1 day
          },
          {
            status: 'Processing',
            location: 'Sorting Hub',
            time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            status: 'Created',
            location: 'Order Placed',
            time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    } catch (err) {
      setError('Failed to fetch tracking data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8 min-h-[70vh]">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">Track Your Shipment</h1>
        <p className="text-muted-foreground">Enter your tracking number below to see the current status of your package.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input 
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="e.g. AF-123456789" 
            className="pl-10 py-6 text-lg w-full"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading} className="py-6 px-8 text-lg">
          {isLoading ? 'Searching...' : 'Track'}
        </Button>
      </form>

      {error && (
        <div className="text-center text-red-600 mb-8 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {trackingData && (
        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="h-6 w-6 text-blue-600" />
                  {trackingData.trackingNumber}
                </CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Delivered by {trackingData.courier}
                </CardDescription>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-muted-foreground flex items-center gap-1 sm:justify-end">
                  <Calendar className="h-4 w-4" /> Estimated Delivery
                </p>
                <p className="font-semibold text-lg text-gray-900">
                  {new Date(trackingData.estimatedDelivery).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {trackingData.events.map((event: any, index: number) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 absolute -left-12 md:left-1/2">
                    {index === 0 ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5 text-gray-400" />}
                  </div>
                  
                  {/* Content */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold text-lg ${index === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{event.status}</h4>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </div>
                    <time className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      {new Date(event.time).toLocaleString()}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
