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

    // 1. Try manager_tasks
    let query = supabase
      .from("manager_tasks")
      .select("*, profiles:assigned_to(id, first_name, last_name)")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (!error && data) {
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

    // 2. Fallback to tasks table (Prisma schema standard)
    let fallbackQuery = supabase
      .from("tasks")
      .select("*, profiles:assignee_id(id, first_name, last_name)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (status) {
      fallbackQuery = fallbackQuery.eq("status", status);
    }

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      console.error("Error fetching tasks from fallback:", fallbackError);
      return [];
    }

    return (fallbackData || []).map((t: any) => {
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
        assigned_to: t.assignee_id,
        assignee_name: assigneeName || undefined,
        created_by: t.created_by,
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

    if (!error && data) {
      let assigneeName = (data as any).profiles
        ? `${(data as any).profiles.first_name || ""} ${(data as any).profiles.last_name || ""}`.trim()
        : "";
      if (!assigneeName && data.description) {
        const match = data.description.match(/\(Assignee:\s*([^)]+)\)/i);
        if (match) assigneeName = match[1].trim();
      }
      return {
        ...(data as any),
        assignee_name: assigneeName || undefined,
      };
    }

    // Fallback to tasks table
    const { data: fallbackData } = await supabase
      .from("tasks")
      .select("*, profiles:assignee_id(id, first_name, last_name)")
      .eq("id", id)
      .maybeSingle();

    if (!fallbackData) return null;

    let assigneeName = (fallbackData as any).profiles
      ? `${(fallbackData as any).profiles.first_name || ""} ${(fallbackData as any).profiles.last_name || ""}`.trim()
      : "";
    if (!assigneeName && fallbackData.description) {
      const match = fallbackData.description.match(/\(Assignee:\s*([^)]+)\)/i);
      if (match) assigneeName = match[1].trim();
    }

    return {
      ...(fallbackData as any),
      assigned_to: (fallbackData as any).assignee_id,
      assignee_name: assigneeName || undefined,
    };
  }

  async createTask(task: Partial<ManagerTask>): Promise<ManagerTask> {
    const supabase = createAdminClient();
    const { assignee_name, ...dbPayload } = task as any;

    // Try manager_tasks
    const { data, error } = await supabase
      .from("manager_tasks")
      .insert(dbPayload)
      .select("*, profiles:assigned_to(id, first_name, last_name)")
      .maybeSingle();

    if (!error && data) {
      let resolvedAssignee = (data as any).profiles
        ? `${(data as any).profiles.first_name || ""} ${(data as any).profiles.last_name || ""}`.trim()
        : "";
      if (!resolvedAssignee && data.description) {
        const match = data.description.match(/\(Assignee:\s*([^)]+)\)/i);
        if (match) resolvedAssignee = match[1].trim();
      }

      return {
        ...(data as any),
        assignee_name: resolvedAssignee || undefined,
      };
    }

    // Fallback to tasks table
    const tasksPayload: any = {
      title: dbPayload.title,
      description: dbPayload.description || null,
      priority: dbPayload.priority || "medium",
      status: dbPayload.status || "pending",
      due_date: dbPayload.due_date || null,
      assignee_id: dbPayload.assigned_to || null,
      created_by: dbPayload.created_by || null,
    };

    const { data: fallbackData, error: fallbackError } = await supabase
      .from("tasks")
      .insert(tasksPayload)
      .select("*, profiles:assignee_id(id, first_name, last_name)")
      .single();

    if (fallbackError) {
      console.error("Error creating task in DB fallback:", fallbackError);
      throw fallbackError;
    }

    let resolvedAssignee = (fallbackData as any).profiles
      ? `${(fallbackData as any).profiles.first_name || ""} ${(fallbackData as any).profiles.last_name || ""}`.trim()
      : "";

    return {
      id: fallbackData.id,
      title: fallbackData.title,
      description: fallbackData.description,
      priority: fallbackData.priority,
      status: fallbackData.status,
      due_date: fallbackData.due_date,
      assigned_to: fallbackData.assignee_id,
      assignee_name: resolvedAssignee || undefined,
      created_by: fallbackData.created_by,
      created_at: fallbackData.created_at,
      updated_at: fallbackData.updated_at,
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
      .maybeSingle();

    if (!error && data) {
      let resolvedAssignee = (data as any).profiles
        ? `${(data as any).profiles.first_name || ""} ${(data as any).profiles.last_name || ""}`.trim()
        : "";
      return {
        ...(data as any),
        assignee_name: resolvedAssignee || undefined,
      };
    }

    // Fallback to tasks table
    const tasksUpdates: any = {
      updated_at: new Date().toISOString(),
    };
    if (dbUpdates.title !== undefined) tasksUpdates.title = dbUpdates.title;
    if (dbUpdates.description !== undefined) tasksUpdates.description = dbUpdates.description;
    if (dbUpdates.priority !== undefined) tasksUpdates.priority = dbUpdates.priority;
    if (dbUpdates.status !== undefined) tasksUpdates.status = dbUpdates.status;
    if (dbUpdates.due_date !== undefined) tasksUpdates.due_date = dbUpdates.due_date;
    if (dbUpdates.assigned_to !== undefined) tasksUpdates.assignee_id = dbUpdates.assigned_to;

    const { data: fallbackData, error: fallbackError } = await supabase
      .from("tasks")
      .update(tasksUpdates)
      .eq("id", id)
      .select("*, profiles:assignee_id(id, first_name, last_name)")
      .single();

    if (fallbackError) {
      console.error("Error updating task in fallback:", fallbackError);
      throw fallbackError;
    }

    return {
      id: fallbackData.id,
      title: fallbackData.title,
      description: fallbackData.description,
      priority: fallbackData.priority,
      status: fallbackData.status,
      due_date: fallbackData.due_date,
      assigned_to: fallbackData.assignee_id,
      created_by: fallbackData.created_by,
      created_at: fallbackData.created_at,
      updated_at: fallbackData.updated_at,
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("manager_tasks")
      .delete()
      .eq("id", id);

    if (error) {
      await supabase.from("tasks").delete().eq("id", id);
    }

    return true;
  }
}
