/** @type {import('next').NextConfig} */
export const nextConfig = {
  images: {
    domains: ['cdn.sanity.io'],
  },
  env: {
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
  },
};

export default nextConfig;

// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
