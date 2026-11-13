import { describe, expect, it } from "vitest";

import { renameNamespaces, toPreviewImports } from "./sync-site-preview.js";

describe("the site preview's copy", () => {
  it("reads a renamed namespace in every translation call, and leaves other text alone", () => {
    const source = [
      'const t = useTranslations("Products")',
      'type Translate = ReturnType<typeof useTranslations<"Products">>',
      'getTranslations({ locale, namespace: "Products" })',
      'aria-label="Products"',
    ].join("\n");

    expect(renameNamespaces(source, { Products: "StartProducts" })).toBe(
      [
        'const t = useTranslations("StartProducts")',
        'type Translate = ReturnType<typeof useTranslations<"StartProducts">>',
        'getTranslations({ locale, namespace: "StartProducts" })',
        'aria-label="Products"',
      ].join("\n"),
    );
    expect(renameNamespaces(source)).toBe(source);
  });

  it("points the module's imports at the preview's folders", () => {
    expect(toPreviewImports('import { api } from "@/lib/api"\nimport { ProductList } from "@/features/products/components/ProductList"')).toBe(
      'import { api } from "@/features/start/demos/users/lib/api"\nimport { ProductList } from "@/features/start/demos/products/components/ProductList"',
    );
  });

  it("points the cart's imports at its own preview folder", () => {
    expect(toPreviewImports('import { Cart } from "@/features/cart/components/Cart"')).toBe(
      'import { Cart } from "@/features/start/demos/cart/components/Cart"',
    );
  });
});
