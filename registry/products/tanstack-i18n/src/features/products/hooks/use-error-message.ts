import { ApiError } from "@/lib/api"

import * as m from "@/paraglide/messages"

/** `ApiError.message` is for logs, so the visitor's language comes from its kind. */
export function useErrorMessage() {
  return (error: unknown) => {
    if (!(error instanceof ApiError)) return m.products_error_unknown()

    if (error.kind === "http" && error.status !== null) {
      return m.products_error_status({ status: error.status })
    }

    return error.kind === "parse" ? m.products_error_unknown() : m.products_error_network()
  }
}
