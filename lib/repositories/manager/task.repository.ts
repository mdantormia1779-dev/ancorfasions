import { createAdminClient } from "@/lib/supabase/admin-client";

export interface ManagerTask {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "archived";
  due_date?: string;
  assigned_to?: string | null;
  assignee_name?: string | null;
  created_by?: string | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export class TaskRepository {
  async getTasks(status?: ManagerTask["status"]): Promise<ManagerTask[]> {
    const supabase = createAdminClient();

    let query = supabase
      .from("manager_tasks")
      .select("*, profiles:assigned_to(id, first_name, last_name)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching manager tasks:", error);
      return [];
    }

    return (data || []).map((t: any) => {
      let assigneeName = t.profiles
        ? `${t.profiles.first_name || ""} ${t.profiles.last_name || ""}`.trim()
        : "";

      if (!assigneeName && t.description) {
        const match = t.description.match(/\(Assignee:\s*([^)]+)\)/i);
        if (match) {
          assigneeName = match[1].trim();
        }
      }

      return {
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        status: t.status,
        due_date: t.due_date,
        assigned_to: t.assigned_to,
        assignee_name: assigneeName || undefined,
        created_by: t.created_by,
        related_entity_type: t.related_entity_type,
        related_entity_id: t.related_entity_id,
        completed_at: t.completed_at,
        created_at: t.created_at,
        updated_at: t.updated_at,
      };
    });
  }

  async getTaskById(id: string): Promise<ManagerTask | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("manager_tasks")
      .select("*, profiles:assigned_to(id, first_name, last_name)")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching task by id:", error);
      return null;
    }
    if (!data) return null;

    let assigneeName = (data as any).profiles
      ? `${(data as any).profiles.first_name || ""} ${(data as any).profiles.last_name || ""}`.trim()
      : "";
    if (!assigneeName && data.description) {
      const match = data.description.match(/\(Assignee:\s*([^)]+)\)/i);
      if (match) {
        assigneeName = match[1].trim();
      }
    }

    return {
      ...(data as any),
      assignee_name: assigneeName || undefined,
    };
  }

  async createTask(task: Partial<ManagerTask>): Promise<ManagerTask> {
    const supabase = createAdminClient();
    const { assignee_name, ...dbPayload } = task as any;

    const { data, error } = await supabase
      .from("manager_tasks")
      .insert(dbPayload)
      .select("*, profiles:assigned_to(id, first_name, last_name)")
      .single();

    if (error) {
      console.error("Error creating task in DB:", error);
      throw error;
    }

    let resolvedAssignee = (data as any).profiles
      ? `${(data as any).profiles.first_name || ""} ${(data as any).profiles.last_name || ""}`.trim()
      : "";
    if (!resolvedAssignee && data.description) {
      const match = data.description.match(/\(Assignee:\s*([^)]+)\)/i);
      if (match) {
        resolvedAssignee = match[1].trim();
      }
    }

    return {
      ...(data as any),
      assignee_name: resolvedAssignee || undefined,
    };
  }

  async updateTask(id: string, updates: Partial<ManagerTask>): Promise<ManagerTask> {
    const supabase = createAdminClient();
    const { assignee_name, ...dbUpdates } = updates as any;

    const { data, error } = await supabase
      .from("manager_tasks")
      .update({
        ...dbUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, profiles:assigned_to(id, first_name, last_name)")
      .single();

    if (error) {
      console.error("Error updating task in DB:", error);
      throw error;
    }

    let resolvedAssignee = (data as any).profiles
      ? `${(data as any).profiles.first_name || ""} ${(data as any).profiles.last_name || ""}`.trim()
      : "";
    if (!resolvedAssignee && data.description) {
      const match = data.description.match(/\(Assignee:\s*([^)]+)\)/i);
      if (match) {
        resolvedAssignee = match[1].trim();
      }
    }

    return {
      ...(data as any),
      assignee_name: resolvedAssignee || undefined,
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("manager_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting task in DB:", error);
      throw error;
    }

    return true;
  }
}
