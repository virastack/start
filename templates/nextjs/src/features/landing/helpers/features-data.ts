export function getFeaturesData(t: (key: string) => string): { title: string; desc: string }[] {
  return [
    { title: t("appRouter.title"), desc: t("appRouter.description") },
    { title: t("typeSafety.title"), desc: t("typeSafety.description") },
    { title: t("query.title"), desc: t("query.description") },
    { title: t("i18n.title"), desc: t("i18n.description") },
    { title: t("forms.title"), desc: t("forms.description") },
    { title: t("ui.title"), desc: t("ui.description") }
  ];
}
