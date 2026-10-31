import { z } from "zod"

// Dışarıdan error map atanabilir hale getiriyoruz
export const getProjectSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(3, t("project_validation_min")).max(50, t("project_validation_max"))
  })

export type ProjectInput = z.infer<ReturnType<typeof getProjectSchema>>
