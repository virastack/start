"use client"

import { useTranslations } from "next-intl"

import { ApiError } from "@/lib/api"

/** `ApiError.message` is for logs, so the visitor's language comes from its kind. */
export function useErrorMessage() {
  const t = useTranslations("Products")

  return (error: unknown) => {
    if (!(error instanceof ApiError)) return t("error_unknown")

    if (error.kind === "http" && error.status !== null) {
      return t("error_status", { status: error.status })
    }

    return error.kind === "parse" ? t("error_unknown") : t("error_network")
  }
}
