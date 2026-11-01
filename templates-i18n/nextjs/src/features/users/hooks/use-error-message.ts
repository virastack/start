"use client"

import { useTranslations } from "next-intl"

import { ApiError } from "@/lib/api"

/** `ApiError.message` is for logs, so the visitor's language comes from its status. */
export function useErrorMessage() {
  const t = useTranslations("Users")

  return (error: unknown) => {
    if (!(error instanceof ApiError)) return t("error_unknown")

    return error.status === 0 ? t("error_network") : t("error_status", { status: error.status })
  }
}
