/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/voicebot',  destination: '/voicebot/index.html' },
      { source: '/voicebot/', destination: '/voicebot/index.html' },
    ];
  },
};
module.exports = nextConfig;