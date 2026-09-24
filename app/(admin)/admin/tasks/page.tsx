import { Metadata } from "next";
import { fetchTasksAction } from "@/app/actions/manager/task.actions";
import { TasksManagerClient } from "@/features/admin/components/tasks/TasksManagerClient";

export const metadata: Metadata = {
  title: "Tasks & Assignments | Admin",
  description: "Manage and monitor workplace assignments and team duties.",
};

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  const { data: allTasks = [] } = await fetchTasksAction();
  const safeTasks = Array.isArray(allTasks) ? allTasks : [];

  return <TasksManagerClient initialTasks={safeTasks} />;
}
