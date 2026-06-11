// PM2 ecosystem config cho Bài 59
// Chạy: pm2 start ecosystem.config.js

module.exports = {
    apps: [{
        name: 'pm2-demo',
        script: './pm2-app.js',
        cwd: __dirname,
        instances: 2,           // Chạy 2 instance (cluster mode)
        exec_mode: 'cluster',   // Load balance giữa các instance
        watch: false,           // Production: tắt watch
        max_memory_restart: '150M', // Auto restart nếu vượt 150MB RAM
        env: {
            NODE_ENV: 'development',
            PORT: 3459
        },
        env_production: {
            NODE_ENV: 'production',
            PORT: 3459
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        merge_logs: true,
        log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }]
};
