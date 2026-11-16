const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

/** @returns {import('next').NextConfig} */
const nextConfig = (phase) => ({
  output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : "export",
  images: {
    unoptimized: true,
  },
});

module.exports = nextConfig;
