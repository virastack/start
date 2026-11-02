/**
 * The page a person adds by hand or by prompt after `virastack add`. The site shows this code and
 * e2e runs it, so what the page tells people is what the tests prove. `sync-site-preview.js` copies
 * this file to the site; change it here.
 */
export type FeatureRouteInfo = {
  feature: string;
  component: string;
  /** Shown while Next.js waits for the URL state on the client, for features with URL state. */
  fallback?: string;
  /** The export TanStack Start spreads into the route, for features with URL state. */
  routeSearch?: { name: string; file: string };
};

export type FeatureRouteOptions = {
  framework: "nextjs" | "tanstack";
  i18n: boolean;
  /** Starts with a slash, as in `/team/members`. */
  path: string;
};

const MAIN_CLASS = "mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6";

function imports(names: string[], feature: string) {
  return names.map((name) => `import { ${name} } from "@/features/${feature}/components/${name}"`);
}

function nextjsRoute({ feature, component, fallback }: FeatureRouteInfo) {
  const content = fallback
    ? [
        `      <Suspense fallback={<${fallback} />}>`,
        `        <${component} />`,
        "      </Suspense>",
      ]
    : [`      <${component} />`];
  return [
    ...(fallback ? ['import { Suspense } from "react"', ""] : []),
    ...imports(fallback ? [component, fallback] : [component], feature),
    "",
    "export default function Page() {",
    "  return (",
    `    <main className="${MAIN_CLASS}">`,
    ...content,
    "    </main>",
    "  )",
    "}",
    "",
  ].join("\n");
}

function tanstackRoute(info: FeatureRouteInfo, routeId: string) {
  const { feature, component, routeSearch } = info;
  return [
    'import { createFileRoute } from "@tanstack/react-router"',
    "",
    ...imports([component], feature),
    ...(routeSearch
      ? [`import { ${routeSearch.name} } from "@/features/${feature}/schemas/${routeSearch.file}"`]
      : []),
    "",
    `export const Route = createFileRoute("${routeId}")({`,
    ...(routeSearch ? [`  ...${routeSearch.name},`] : []),
    "  component: RouteComponent",
    "})",
    "",
    "function RouteComponent() {",
    "  return (",
    `    <main className="${MAIN_CLASS}">`,
    `      <${component} />`,
    "    </main>",
    "  )",
    "}",
    "",
  ].join("\n");
}

export function buildFeatureRoute(info: FeatureRouteInfo, { framework, i18n, path }: FeatureRouteOptions) {
  if (framework === "nextjs") {
    return {
      file: `src/app${i18n ? "/[locale]" : ""}${path}/page.tsx`,
      code: nextjsRoute(info),
    };
  }
  const prefix = i18n ? "/{-$lang}" : "";
  return {
    file: `src/routes${prefix}${path}.tsx`,
    code: tanstackRoute(info, `${prefix}${path}`),
  };
}
