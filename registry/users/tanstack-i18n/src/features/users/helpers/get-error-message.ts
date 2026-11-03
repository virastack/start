import { ApiError } from "@/lib/api"

import * as m from "@/paraglide/messages.js"

/** `ApiError.message` is for logs, so the visitor's language comes from its kind. */
export function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) return m.users_error_generic()

  if (error.kind === "http" && error.status !== null) {
    return m.users_error_status({ status: error.status })
  }

  return error.kind === "parse" ? m.users_error_generic() : m.users_error_network()
}
