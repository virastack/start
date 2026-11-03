import type { UserFormInput } from "@/features/users/schemas/user.schema"

/** The form is flat; the API keeps the position and department under `company`. */
export function toUserBody({ title, department, ...user }: UserFormInput) {
  return { ...user, company: { title, department } }
}
