// PM2 process config for the Trim API on Windows/IIS.
// Run from this folder (packages\api) after building:
//   pnpm --filter @trim/api build      (produces dist/index.js)
//   pm2 start ecosystem.config.cjs
//
// Environment variables are loaded by the app itself from .env (it imports
// "dotenv/config"), so put MONGODB_URI / BASE_URL / CLIENT_URL in packages\api\.env.
// PORT below must match the reverse-proxy target in web.config (4000).

module.exports = {
  apps: [
    {
      name: "trim-api",
      script: "dist/index.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 10,
      max_memory_restart: "300M",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
