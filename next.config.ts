import type { NextConfig } from "next";

// Fail build if DEMO_MODE is accidentally enabled in production
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
  throw new Error('FATAL: NEXT_PUBLIC_DEMO_MODE=true in production build. Aborting.')
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
