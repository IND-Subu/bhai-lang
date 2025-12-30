// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const moduleExports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent Next from bundling better-sqlite3 (native module)
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
      });

      // Stop Webpack from trying to polyfill Node core APIs
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        module: false,
      };
    }

    return config;
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
};

module.exports = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(moduleExports, sentryWebpackPluginOptions)
  : moduleExports;
