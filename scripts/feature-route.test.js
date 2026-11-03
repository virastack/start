import { describe, expect, it } from "vitest";
import { FEATURES } from "./build-registry.js";
import { buildFeatureRoute } from "./feature-route.ts";

const [{ route: users }] = FEATURES;

describe("buildFeatureRoute", () => {
  it.each([
    ["nextjs", false, "/users", "src/app/users/page.tsx"],
    ["nextjs", true, "/users", "src/app/[locale]/users/page.tsx"],
    ["tanstack", false, "/users", "src/routes/users.tsx"],
    ["tanstack", true, "/users", "src/routes/{-$lang}/users.tsx"],
    ["nextjs", false, "/team/members", "src/app/team/members/page.tsx"],
    ["nextjs", true, "/team/members", "src/app/[locale]/team/members/page.tsx"],
    ["tanstack", false, "/team/members", "src/routes/team/members.tsx"],
    ["tanstack", true, "/team/members", "src/routes/{-$lang}/team/members.tsx"],
  ])("puts %s, i18n %s, %s at %s", (framework, i18n, path, file) => {
    const options = { framework: /** @type {"nextjs" | "tanstack"} */ (framework), i18n, path };
    expect(buildFeatureRoute(users, options).file).toBe(file);
  });

  it("wraps the Next.js component in Suspense for its URL state", () => {
    const { code } = buildFeatureRoute(users, { framework: "nextjs", i18n: false, path: "/team" });
    expect(code).toContain("<Suspense fallback={<UsersDirectorySkeleton />}>");
    expect(code).toContain('from "@/features/users/components/UsersDirectory"');
    expect(code).not.toContain("usersRouteSearch");
  });

  it.each([
    [false, 'createFileRoute("/team")'],
    [true, 'createFileRoute("/{-$lang}/team")'],
  ])("gives TanStack Start, i18n %s, the route id and URL state", (i18n, route) => {
    const { code } = buildFeatureRoute(users, { framework: "tanstack", i18n, path: "/team" });
    expect(code).toContain(route);
    expect(code).toContain("...usersRouteSearch,");
    expect(code).toContain('from "@/features/users/schemas/users-params.schema"');
    expect(code).not.toContain("Suspense");
  });

  it("needs no Suspense or URL state for a feature without URL state", () => {
    const route = { feature: "checkout-address", component: "CheckoutAddress" };
    const nextjs = buildFeatureRoute(route, { framework: "nextjs", i18n: false, path: "/checkout" });
    const tanstack = buildFeatureRoute(route, { framework: "tanstack", i18n: false, path: "/checkout" });
    expect(nextjs.code).not.toContain("Suspense");
    expect(tanstack.code).toContain('createFileRoute("/checkout")({\n  component: RouteComponent');
  });

  it("leaves URL state out of a feature without it", () => {
    const { routeSearch, ...plain } = users;
    const { code } = buildFeatureRoute(plain, { framework: "tanstack", i18n: false, path: "/team" });
    expect(routeSearch).toBeDefined();
    expect(code).not.toContain("usersRouteSearch");
  });
});
