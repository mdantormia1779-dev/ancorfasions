import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { fetchTasksAction } from "@/app/actions/manager/task.actions";
import { ManagerTask } from "@/lib/repositories/manager/task.repository";

export const metadata: Metadata = {
  title: "Tasks | Manager Dashboard",
};

export default async function TasksPage() {
  const { data: allTasks = [] } = await fetchTasksAction();
  
  const pendingTasks = allTasks.filter((t: ManagerTask) => t.status === 'pending');
  const inProgressTasks = allTasks.filter((t: ManagerTask) => t.status === 'in_progress');
  const completedTasks = allTasks.filter((t: ManagerTask) => t.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 font-bold';
      case 'high': return 'text-orange-500 font-semibold';
      case 'medium': return 'text-blue-500';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date';
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Due Today';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return 'Due Tomorrow';
    
    return `Due ${d.toLocaleDateString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your daily operational tasks and assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
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
                <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className={getPriorityColor(task.priority)}>{formatDate(task.due_date)}</span>
                  <span className="text-muted-foreground">{task.related_entity_type || 'General'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
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
                <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className={getPriorityColor(task.priority)}>{formatDate(task.due_date)}</span>
                  <span className="text-muted-foreground">{task.related_entity_type || 'General'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Completed
            </h2>
            <Badge variant="secondary">{completedTasks.length}</Badge>
          </div>
          
          {completedTasks.map((task: ManagerTask) => (
            <Card key={task.id} className="opacity-60 bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base line-through">{task.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-green-600 font-medium">Done</span>
                  <span className="text-muted-foreground">{task.related_entity_type || 'General'}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
