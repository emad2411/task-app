import { z } from "zod";

export const taskStatusValues = ["todo", "in_progress", "done", "archived"] as const;
export const taskPriorityValues = ["low", "medium", "high"] as const;
export const sortFieldValues = ["dueDate", "createdAt", "updatedAt", "priority", "title"] as const;
export const sortOrderValues = ["asc", "desc"] as const;
export const groupByValues = ["status", "category", "dueDate"] as const;
export const dueDateFilterValues = ["today", "upcoming", "overdue", "none"] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(2000, "Description must be less than 2000 characters").optional(),
  status: z.enum(taskStatusValues).default("todo"),
  priority: z.enum(taskPriorityValues).default("medium"),
  dueDate: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
});

export const updateTaskSchema = createTaskSchema.extend({
  id: z.uuid(),
});

// Helper to normalize single value or array to array
const normalizeToArray = <T>(val: T | T[]): T[] =>
  Array.isArray(val) ? val : val !== undefined ? [val] : [];

export const taskFilterSchema = z.object({
  status: z.union([z.enum(taskStatusValues), z.array(z.enum(taskStatusValues))])
    .transform(normalizeToArray)
    .optional(),
  priority: z.union([z.enum(taskPriorityValues), z.array(z.enum(taskPriorityValues))])
    .transform(normalizeToArray)
    .optional(),
  category: z.uuid().optional(),
  q: z.string().trim().max(100).optional(),
  dueDate: z.enum(dueDateFilterValues).optional(),
}).partial();

export const taskSortSchema = z.object({
  sort: z.enum(sortFieldValues).optional(),
  order: z.enum(sortOrderValues).optional(),
}).partial();

export const taskGroupBySchema = z.object({
  groupBy: z.enum(groupByValues).optional(),
}).partial();

export const taskQueryParamsSchema = taskFilterSchema
  .merge(taskSortSchema)
  .merge(taskGroupBySchema);

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type TaskSortInput = z.infer<typeof taskSortSchema>;
export type TaskGroupByInput = z.infer<typeof taskGroupBySchema>;
export type TaskQueryParams = z.infer<typeof taskQueryParamsSchema>;
