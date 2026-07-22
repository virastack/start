"use client";

import { useTranslations } from "next-intl";

import { Card, CardDescription, CardHeader, CardTitle } from "@/ui";
import { getFeaturesData } from "@/features/landing/helpers/features-data";

export function FeaturesList() {
  const t = useTranslations("Features");
  const data = getFeaturesData(t);

  return (
    <section className="w-full bg-muted/50 py-16">
      <div className="mx-auto mb-6 max-w-5xl space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map(({ title, desc }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
