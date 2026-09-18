"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { createTaskAction, fetchStaffMembersAction } from "@/app/actions/manager/task.actions";
import { ManagerTask } from "@/lib/repositories/manager/task.repository";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const taskSchema = z.object({
  title: z
    .string({ required_error: "Task title is required" })
    .trim()
    .min(3, "Task title is required (minimum 3 characters)"),
  description: z
    .string({ required_error: "Task description is required" })
    .trim()
    .min(5, "Task description is required (minimum 5 characters)"),
  priority: z.enum(["low", "medium", "high", "urgent"], {
    errorMap: () => ({ message: "Please select a priority" }),
  }),
  status: z.enum(["pending", "in_progress", "completed", "archived"], {
    errorMap: () => ({ message: "Please select a status" }),
  }),
  due_date: z
    .string({ required_error: "Due date is required" })
    .trim()
    .min(1, "Due date is required"),
  assigned_to: z
    .string({ required_error: "Assignee is required" })
    .trim()
    .min(2, "Assignee is required (minimum 2 characters)"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface AddTaskDialogProps {
  onTaskCreated?: (task: ManagerTask) => void;
  trigger?: React.ReactNode;
}

export function AddTaskDialog({ onTaskCreated, trigger }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const router = useRouter();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
      due_date: "",
      assigned_to: "",
    },
  });

  const handleOpenChange = async (val: boolean) => {
    setOpen(val);
    if (val && staff.length === 0) {
      const res = await fetchStaffMembersAction();
      if (res.success && res.data) {
        setStaff(res.data);
      }
    }
    if (!val) form.reset();
  };

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const res = await createTaskAction(data);
      if (res.success && res.data) {
        toast.success("Task created successfully");
        onTaskCreated?.(res.data as ManagerTask);
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create task");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          (trigger as React.ReactElement) || (
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Task</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create an operational task or duty assignment. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Task Title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Audit Winter Collection warehouse bins"
                      {...field}
                      className={
                        form.formState.errors.title
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive font-medium" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Task Description <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed instructions, checklist, and expectations..."
                      rows={3}
                      {...field}
                      className={
                        form.formState.errors.description
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-destructive font-medium" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Priority <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={
                            form.formState.errors.priority
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-destructive font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Status <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className={
                            form.formState.errors.status
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-destructive font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Due Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className={
                          form.formState.errors.due_date
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive font-medium" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Assignee <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          list="staff-options"
                          placeholder="e.g. Operations Team, John Doe"
                          {...field}
                          className={
                            form.formState.errors.assigned_to
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />
                        {staff.length > 0 && (
                          <datalist id="staff-options">
                            {staff.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.role}
                              </option>
                            ))}
                          </datalist>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive font-medium" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting} className="gap-2">
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Task"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
