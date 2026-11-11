import { request } from "./api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  data: Task[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface TaskListParams {
  status?: TaskStatus;
  page: number;
  limit: number;
}

export interface TaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export const tasksApi = {
  list: ({ status, page, limit }: TaskListParams) => {
    const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) qs.set("status", status);
    return request<TaskList>(`/tasks?${qs.toString()}`);
  },

  create: (input: TaskInput) => request<Task>("/tasks", { method: "POST", body: input }),

  update: (id: string, input: TaskInput) =>
    request<Task>(`/tasks/${id}`, { method: "PATCH", body: input }),

  remove: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
