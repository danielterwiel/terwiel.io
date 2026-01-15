/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.mjs");

import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// /** @type {import("next").NextConfig} */
const config = {
  experimental: {
    viewTransition: true,
  },
  /**
   * @param {import('webpack').Configuration} config
   * @returns {import('webpack').Configuration}
   */
  webpack(config) {
    // Grab the existing rule that handles SVG imports

    /**
     * @type {false | "" | 0 | import('webpack').RuleSetRule | "..." | null | undefined}
     */
    const fileLoaderRule = config.module?.rules?.find(
      (rule) =>
        rule &&
        typeof rule === "object" &&
        "test" in rule &&
        rule.test instanceof RegExp &&
        rule.test.test(".svg"),
    );

    if (
      fileLoaderRule &&
      typeof fileLoaderRule === "object" &&
      fileLoaderRule.resourceQuery &&
      typeof fileLoaderRule.resourceQuery === "object" &&
      "not" in fileLoaderRule.resourceQuery &&
      typeof fileLoaderRule.resourceQuery.not === "object" &&
      !(fileLoaderRule.resourceQuery.not instanceof RegExp) &&
      Array.isArray(fileLoaderRule.resourceQuery.not)
    ) {
      config?.module?.rules?.push(
        // Reapply the existing rule, but only for svg imports ending in ?url
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/, // *.svg?url
        },
        // Convert all other *.svg imports to React components
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
          use: ["@svgr/webpack"],
        },
      );
    }

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    if (fileLoaderRule && typeof fileLoaderRule === "object") {
      fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
  },
};

export default withBundleAnalyzer(config);
