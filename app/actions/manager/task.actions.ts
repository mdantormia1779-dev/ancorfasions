'use server';

import { TaskRepository, ManagerTask } from '@/lib/repositories/manager/task.repository';

const taskRepo = new TaskRepository();

export async function fetchTasksAction(status?: ManagerTask['status']) {
  try {
    const data = await taskRepo.getTasks(status);
    return { success: true, data };
  } catch (error: any) {
    console.error('fetchTasksAction error:', error);
    return { success: false, error: error.message, data: [] };
  }
}
