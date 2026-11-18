import { api } from "@/lib/api"

import { REGISTER_PATH } from "@/features/auth/constants/auth.constants"
import { registeredUserSchema } from "@/features/auth/schemas/auth.schema"
import type { RegisteredUser, RegisterFormInput } from "@/features/auth/schemas/auth.schema"

/**
 * Sends the password once, for your server to hash; the confirmation stays in the form. The
 * schema drops the password DummyJSON echoes back.
 */
export function register(input: RegisterFormInput, signal?: AbortSignal): Promise<RegisteredUser> {
  const { firstName, lastName, username, email, password } = input
  return api.post(
    REGISTER_PATH,
    { firstName, lastName, username, email, password },
    { schema: registeredUserSchema, signal }
  )
}
