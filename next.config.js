/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 's.gravatar.com'],
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
