import type { NextConfig } from "next";

import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";
import type { RuleSetRule } from "webpack";

const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  htmlLimitedBots: /.*/,
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: { typescript: true, icon: true, titleProp: true, svgo: true, prettier: false }
          }
        ],
        as: "*.js"
      }
    }
  },
  webpack(config) {
    const rules = config.module.rules as RuleSetRule[];
    const fileLoaderRule = rules.find(
      (rule): rule is RuleSetRule =>
        !!rule && typeof rule === "object" && rule.test instanceof RegExp && rule.test.test(".svg")
    );
    if (fileLoaderRule) fileLoaderRule.exclude = /\.svg$/i;
    config.module.rules.push({ test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ["@svgr/webpack"] });
    return config;
  }
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
