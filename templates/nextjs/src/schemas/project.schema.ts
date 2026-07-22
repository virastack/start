import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters").max(50),
});

export type ProjectInput = z.infer<typeof projectSchema>;
