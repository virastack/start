import { ApiError } from "@/lib/api"

import * as m from "@/paraglide/messages.js"

/** `ApiError.message` is English for developers, so what the user reads comes from its status. */
export function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return m.users_error_generic()

  return error.status === 0
    ? m.users_error_network()
    : m.users_error_status({ status: error.status })
}
