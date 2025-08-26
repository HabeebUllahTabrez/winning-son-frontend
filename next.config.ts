import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default {
  output: 'export',
  images: { unoptimized: true },
} satisfies import('next').NextConfig;
