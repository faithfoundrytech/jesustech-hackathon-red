import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['placehold.co'],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
