module.exports = {
  apps: [
    {
      name: 'booking-xgm-api',
      cwd: process.env.APP_CWD || '/var/www/booking-xgm/api',
      script: 'dist/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      node_args: '--max-old-space-size=256',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      out_file: process.env.APP_LOG_OUT || '/var/www/booking-xgm/logs/api-out.log',
      error_file: process.env.APP_LOG_ERR || '/var/www/booking-xgm/logs/api-err.log',
    },
  ],
}
