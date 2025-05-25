import type {NextConfig} from 'next';
import withPWAInit from 'next-pwa';

const isDev = process.env.NODE_ENV === 'development';

const withPWA = withPWAInit({
  dest: 'public',
  disable: isDev, // Deshabilita PWA en desarrollo para evitar problemas de caché con HMR
  register: true,
  skipWaiting: true,
  // También puedes configurar aquí el runtimeCaching si necesitas estrategias específicas
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
