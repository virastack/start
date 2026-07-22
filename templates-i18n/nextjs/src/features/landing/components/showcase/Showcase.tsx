"use client";

import { useTranslations } from "next-intl";

import { AuthForm, UserList } from "@/features/landing";

export function Showcase() {
  const t = useTranslations("Showcase");

  return (
    <section className="container w-full max-w-5xl py-16">
      <div className="mb-6 space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-20 md:grid-cols-3">
        <UserList />
        <AuthForm />
      </div>
    </section>
  );
}
