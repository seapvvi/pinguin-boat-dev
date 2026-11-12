// PM2 resolves `cwd` and log paths against the directory you run `pm2` from,
// not against this file, so every path here is absolute.
// Override the install root with PINGUIN_ROOT, e.g.:
//   PINGUIN_ROOT=$HOME/pinguin-boat-dev pm2 start deploy/pm2.config.json
// Defaults to the /opt layout created by scripts/install.sh.
const root = process.env.PINGUIN_ROOT || "/opt/pinguinboat/current";
const logs = process.env.PINGUIN_LOGS || "/opt/pinguinboat/shared/logs";

module.exports = {
  apps: [
    {
      name: "pinguin-api",
      script: `${root}/apps/api/dist/apps/api/src/index.js`,
      cwd: root,
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      error_file: `${logs}/api-error.log`,
      out_file: `${logs}/api-out.log`,
      log_file: `${logs}/api-combined.log`,
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: "512M",
    },
    {
      name: "pinguin-bot",
      script: `${root}/apps/bot/dist/apps/bot/src/index.js`,
      cwd: root,
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      error_file: `${logs}/bot-error.log`,
      out_file: `${logs}/bot-out.log`,
      log_file: `${logs}/bot-combined.log`,
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: "800M",
    },
    {
      name: "pinguin-web",
      // apps/web has no server.js; the dashboard is started with `next start`.
      script: `${root}/node_modules/next/dist/bin/next`,
      args: "start",
      cwd: `${root}/apps/web`,
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", PORT: 3000 },
      error_file: `${logs}/web-error.log`,
      out_file: `${logs}/web-out.log`,
      log_file: `${logs}/web-combined.log`,
      merge_logs: true,
      max_restarts: 10,
      restart_delay: 5000,
      max_memory_restart: "512M",
    },
  ],
};
