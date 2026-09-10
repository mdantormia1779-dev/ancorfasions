import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { AddTaskDialog } from "@/app/(manager)/manager/tasks/AddTaskDialog";
import { fetchTasksAction } from "@/app/actions/manager/task.actions";
import { ManagerTask } from "@/lib/repositories/manager/task.repository";

export const metadata: Metadata = {
  title: "Tasks & Assignments | Admin",
  description: "Manage and monitor workplace assignments and team duties.",
};

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const { data: allTasks = [] } = await fetchTasksAction();

  const pendingTasks = allTasks.filter(
    (t: ManagerTask) => t.status === "pending"
  );
  const inProgressTasks = allTasks.filter(
    (t: ManagerTask) => t.status === "in_progress"
  );
  const completedTasks = allTasks.filter(
    (t: ManagerTask) => t.status === "completed"
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-500 font-bold";
      case "high":
        return "text-orange-500 font-semibold";
      case "medium":
        return "text-blue-500";
      case "low":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "No due date";
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Due Today";

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "Due Tomorrow";

    return `Due ${d.toLocaleDateString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assigned Tasks</h1>
          <p className="mt-1 text-muted-foreground">
            Manage, delegate, and track team assignments and operations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddTaskDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Pending Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-foreground">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending
            </h2>
            <Badge variant="secondary">{pendingTasks.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {pendingTasks.length === 0 ? (
              <Card className="border-dashed bg-transparent p-6 text-center text-muted-foreground text-sm">
                No pending tasks
              </Card>
            ) : (
              pendingTasks.map((task: ManagerTask) => (
                <Card key={task.id} className="transition-all hover:border-primary/50 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium leading-snug">
                        {task.title}
                      </CardTitle>
                      <span
                        className={`text-xs uppercase tracking-wider ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-foreground">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              In Progress
            </h2>
            <Badge variant="secondary">{inProgressTasks.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {inProgressTasks.length === 0 ? (
              <Card className="border-dashed bg-transparent p-6 text-center text-muted-foreground text-sm">
                No tasks in progress
              </Card>
            ) : (
              inProgressTasks.map((task: ManagerTask) => (
                <Card key={task.id} className="border-blue-200/50 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium leading-snug">
                        {task.title}
                      </CardTitle>
                      <span
                        className={`text-xs uppercase tracking-wider ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Completed
            </h2>
            <Badge variant="secondary">{completedTasks.length}</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {completedTasks.length === 0 ? (
              <Card className="border-dashed bg-transparent p-6 text-center text-muted-foreground text-sm">
                No completed tasks
              </Card>
            ) : (
              completedTasks.map((task: ManagerTask) => (
                <Card key={task.id} className="opacity-75 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-medium leading-snug line-through text-muted-foreground">
                        {task.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {task.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                      <span>{formatDate(task.due_date)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
