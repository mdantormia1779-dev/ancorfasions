"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CustomerActionButtons({ customerId, initialPoints }: { customerId: string, initialPoints: number }) {
  const [points, setPoints] = useState(initialPoints);
  const [pointsDelta, setPointsDelta] = useState(0);
  const [message, setMessage] = useState("");
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isPointsOpen, setIsPointsOpen] = useState(false);

  const handleAdjustPoints = async () => {
    // In a real app, you would call a server action here to update `loyalty_points`
    // e.g. await adjustLoyaltyPoints(customerId, pointsDelta)
    toast.success(`Successfully adjusted points by ${pointsDelta}`);
    setPoints(points + Number(pointsDelta));
    setIsPointsOpen(false);
  };

  const handleSendMessage = async () => {
    // Call server action to send email/SMS
    toast.success("Message sent successfully to customer");
    setIsMessageOpen(false);
    setMessage("");
  };

  return (
    <div className="flex gap-2">
      <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
        <DialogTrigger render={<Button variant="outline" />}>
          Message
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>
              Send an email or SMS directly to this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                placeholder="Type your message here..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMessageOpen(false)}>Cancel</Button>
            <Button onClick={handleSendMessage}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPointsOpen} onOpenChange={setIsPointsOpen}>
        <DialogTrigger render={<Button variant="outline" />}>
          Adjust Points
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Reward Points</DialogTitle>
            <DialogDescription>
              Add or remove loyalty points for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Adjustment (use negative to remove)</Label>
              <Input 
                type="number" 
                value={pointsDelta}
                onChange={(e) => setPointsDelta(Number(e.target.value))}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              New Balance: {points + Number(pointsDelta)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPointsOpen(false)}>Cancel</Button>
            <Button onClick={handleAdjustPoints}>Apply Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="ghost" size="icon">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
}
