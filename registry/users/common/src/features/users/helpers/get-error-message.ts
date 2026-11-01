import { ApiError } from "@/lib/api"

export function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "Something went wrong."
}
