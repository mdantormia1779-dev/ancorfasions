import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { AddTaskDialog } from "./AddTaskDialog";
import { fetchTasksAction } from "@/app/actions/manager/task.actions";
import { ManagerTask } from "@/lib/repositories/manager/task.repository";

export const metadata: Metadata = {
  title: "Tasks | Manager Dashboard",
};

export default async function TasksPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your daily operational tasks and assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddTaskDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              To Do
            </h2>
            <Badge variant="secondary">{pendingTasks.length}</Badge>
          </div>

          {pendingTasks.map((task: ManagerTask) => (
            <Card key={task.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {task.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className={getPriorityColor(task.priority)}>
                    {formatDate(task.due_date)}
                  </span>
                  <span className="text-muted-foreground">
                    {task.related_entity_type || "General"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-blue-500" />
              In Progress
            </h2>
            <Badge variant="secondary">{inProgressTasks.length}</Badge>
          </div>

          {inProgressTasks.map((task: ManagerTask) => (
            <Card key={task.id} className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {task.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className={getPriorityColor(task.priority)}>
                    {formatDate(task.due_date)}
                  </span>
                  <span className="text-muted-foreground">
                    {task.related_entity_type || "General"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed
            </h2>
            <Badge variant="secondary">{completedTasks.length}</Badge>
          </div>

          {completedTasks.map((task: ManagerTask) => (
            <Card key={task.id} className="bg-muted/50 opacity-60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-through">
                  {task.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  {task.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-green-600">Done</span>
                  <span className="text-muted-foreground">
                    {task.related_entity_type || "General"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
