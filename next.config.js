/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/spiele',
        permanent: true,
      },
      {
        source: '/spiele/:spielId/:spielerId',
        destination: '/spiele/:spielId',
        permanent: true,
      },
    ];
  },
};
