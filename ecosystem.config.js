module.exports = {
  apps: [{
    name: 'idea-ecommerce',
    script: 'server.cjs',
    instances: 'max', // Use all available CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto restart
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'dist'],
    max_memory_restart: '1G',
    
    // Restart settings
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    
    // Cluster settings
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Environment
    source_map_support: false,
    instance_var: 'INSTANCE_ID'
  }],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/master',
      repo: 'git@github.com:your-repo/idea.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run prod:build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 