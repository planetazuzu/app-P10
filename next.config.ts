
import type {NextConfig} from 'next';
import withPWAInit from 'next-pwa';
import runtimeCaching from 'next-pwa/cache';

const isDev = process.env.NODE_ENV === 'development';

const withPWA = withPWAInit({
  dest: 'public',
  disable: isDev, // Deshabilita PWA en desarrollo para evitar problemas de caché con HMR
  register: true,
  skipWaiting: true,
  runtimeCaching, // Añade estrategias de caché en tiempo de ejecución por defecto
  buildExcludes: [/middleware-manifest\.json$/], // Exclusión común para evitar conflictos
  // También puedes configurar aquí el runtimeCaching si necesitas estrategias específicas, por ejemplo:
  // runtimeCaching: [
  //   ...runtimeCaching, // Mantiene las estrategias por defecto
  //   {
  //     urlPattern: /^https:\/\/your-api-endpoint\.com\/.*/, // Ejemplo para tu API
  //     handler: 'NetworkFirst',
  //     options: {
  //       cacheName: 'api-cache',
  //       expiration: {
  //         maxEntries: 50,
  //         maxAgeSeconds: 24 * 60 * 60, // 1 día
  //       },
  //       cacheableResponse: {
  //         statuses: [0, 200],
  //       },
  //     },
  //   },
  // ],
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: true, // Mantener true para buenas prácticas, aunque puede causar doble render en dev
};

export default withPWA(nextConfig);
