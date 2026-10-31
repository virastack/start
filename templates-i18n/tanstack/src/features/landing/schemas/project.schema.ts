import { z } from "zod"

import * as m from "@/paraglide/messages.js"

export const getProjectSchema = () =>
  z.object({
    name: z.string().min(3, m.project_validation_min()).max(50, m.project_validation_max())
  })

export type ProjectInput = z.infer<ReturnType<typeof getProjectSchema>>
