import { z } from "zod";

export function createAuthSchema(t: (key: string) => string) {
  return z.object({
    username: z
      .string()
      .min(3, t("usernameMin"))
      .regex(/^[a-zA-Z0-9_]+$/, t("usernameRegex")),
    password: z.string().min(6, t("passwordMin"))
  });
}

export type AuthFormValues = z.infer<ReturnType<typeof createAuthSchema>>;
