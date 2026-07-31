"use client";

import { useTransition } from "react";
import { CustomerNotification } from "@/types/customer.types";
import { markNotificationAsReadAction } from "@/app/actions/customer.actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellDot, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationCenterProps {
  notifications: CustomerNotification[];
}

export function NotificationCenter({ notifications }: NotificationCenterProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Notifications</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="rounded-lg border bg-muted/20 py-8 text-center text-muted-foreground">
            You're all caught up!
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start justify-between gap-4 rounded-lg border p-4 transition-colors ${!notification.is_read ? "border-primary/20 bg-primary/5" : "bg-card"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {!notification.is_read ? (
                      <BellDot className="h-5 w-5 text-primary" />
                    ) : (
                      <Bell className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {notification.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={isPending}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Mark Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
