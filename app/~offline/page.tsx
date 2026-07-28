import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="bg-muted p-6 rounded-full mb-6">
        <WifiOff className="w-12 h-12 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">You are offline</h1>
      <p className="text-muted-foreground max-w-[400px]">
        It looks like you've lost your internet connection. Please check your network and try again.
      </p>
    </div>
  );
}
