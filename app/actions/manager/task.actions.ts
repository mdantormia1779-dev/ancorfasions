"use server";

import {
  TaskRepository,
  ManagerTask,
} from "@/lib/repositories/manager/task.repository";

const taskRepo = new TaskRepository();

export async function fetchTasksAction(status?: ManagerTask["status"]) {
  try {
    const data = await taskRepo.getTasks(status);
    return { success: true, data };
  } catch (error: any) {
    console.error("fetchTasksAction error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createTaskAction(data: {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "archived";
  due_date?: string;
}) {
  try {
    const task = await taskRepo.createTask(data);
    return { success: true, data: task };
  } catch (error: any) {
    console.error("createTaskAction error:", error);
    return { success: false, error: error.message };
  }
}
