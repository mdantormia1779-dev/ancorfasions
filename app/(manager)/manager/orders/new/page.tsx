import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Order | Manager Dashboard",
};

export default function NewOrderPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Order</h1>
        <p className="mt-1 text-muted-foreground">
          This feature is currently under development. You will soon be able to manually create orders from the manager dashboard.
        </p>
      </div>
      <div className="p-12 text-center border rounded-lg bg-card text-muted-foreground">
        Order creation interface coming soon.
      </div>
    </div>
  );
}
