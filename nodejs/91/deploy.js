// Bài 91: Deploy Node.js lên VPS — Hướng dẫn và script deploy
// Nginx config: 91/nginx.conf
// Chạy xem hướng dẫn: node 91/deploy.js

/**
 * ═══════════════════════════════════════════════════════════
 * QUY TRÌNH DEPLOY NODE.JS LÊN VPS (Ubuntu 22.04)
 * ═══════════════════════════════════════════════════════════
 *
 * 1. CHUẨN BỊ VPS
 *    ssh root@your-server-ip
 *    adduser deploy && usermod -aG sudo deploy
 *    ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
 *
 * 2. CÀI ĐẶT RUNTIME
 *    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
 *    sudo apt install -y nodejs nginx git
 *    sudo npm install -g pm2
 *
 * 3. CLONE & BUILD APP
 *    su - deploy
 *    git clone https://github.com/you/nodejs-app.git /home/deploy/app
 *    cd /home/deploy/app/nodejs
 *    npm ci --only=production
 *    cp .env.example .env  # Chỉnh sửa biến môi trường production
 *
 * 4. CHẠY VỚI PM2
 *    pm2 start 84/graceful-shutdown.js --name nodejs-app
 *    pm2 save
 *    pm2 startup  # Tự khởi động khi reboot server
 *
 * 5. CẤU HÌNH NGINX
 *    sudo cp 91/nginx.conf /etc/nginx/sites-available/nodejs-app
 *    # Sửa server_name và ssl_certificate paths
 *    sudo ln -s /etc/nginx/sites-available/nodejs-app /etc/nginx/sites-enabled/
 *    sudo nginx -t && sudo systemctl reload nginx
 *
 * 6. SSL LET'S ENCRYPT
 *    sudo apt install certbot python3-certbot-nginx
 *    sudo certbot --nginx -d yourdomain.com
 *    # Auto-renew: certbot renew --dry-run
 *
 * 7. DEPLOY PHIÊN BẢN MỚI (zero-downtime)
 *    git pull origin main
 *    npm ci --only=production
 *    pm2 reload nodejs-app  # Graceful reload, không drop connection
 *
 * 8. MONITORING
 *    pm2 monit
 *    pm2 logs nodejs-app
 *    tail -f /var/log/nginx/nodejs-app.access.log
 */

// Script deploy tự động (chạy trên VPS sau khi SSH)
const { execSync } = require('child_process');
const path = require('path');

const CONFIG = {
    appName: 'nodejs-app',
    appDir: process.env.APP_DIR || '/home/deploy/app/nodejs',
    branch: process.env.DEPLOY_BRANCH || 'main',
    entryFile: process.env.ENTRY_FILE || '84/graceful-shutdown.js',
};

function run(cmd, options = {}) {
    console.log(`> ${cmd}`);
    return execSync(cmd, { stdio: 'inherit', ...options });
}

function deploy() {
    console.log(`\n[DEPLOY] Bắt đầu deploy ${CONFIG.appName}`);
    console.log(`[DEPLOY] Thư mục: ${CONFIG.appDir}\n`);

    const steps = [
        {
            name: 'Git pull',
            fn: () => run(`git pull origin ${CONFIG.branch}`, { cwd: CONFIG.appDir }),
        },
        {
            name: 'Install dependencies',
            fn: () => run('npm ci --only=production', { cwd: CONFIG.appDir }),
        },
        {
            name: 'PM2 reload (zero-downtime)',
            fn: () => run(`pm2 reload ${CONFIG.appName} || pm2 start ${CONFIG.entryFile} --name ${CONFIG.appName}`, {
                cwd: CONFIG.appDir,
            }),
        },
        {
            name: 'PM2 save',
            fn: () => run('pm2 save'),
        },
        {
            name: 'Health check',
            fn: () => {
                try {
                    run('curl -sf http://localhost:3000/health || curl -sf http://localhost:3084/');
                } catch {
                    console.warn('[DEPLOY] Health check thất bại — kiểm tra logs: pm2 logs');
                }
            },
        },
    ];

    for (const step of steps) {
        console.log(`\n[DEPLOY] ▶ ${step.name}`);
        try {
            step.fn();
            console.log(`[DEPLOY] ✓ ${step.name}`);
        } catch (err) {
            console.error(`[DEPLOY] ✗ ${step.name} — ROLLBACK thủ công nếu cần`);
            console.error('  pm2 logs', CONFIG.appName);
            process.exit(1);
        }
    }

    console.log('\n[DEPLOY] Hoàn tất! Kiểm tra: pm2 status');
}

// In hướng dẫn khi chạy không có flag --deploy
if (require.main === module) {
    if (process.argv.includes('--deploy')) {
        deploy();
    } else {
        console.log('=== HƯỚNG DẪN DEPLOY VPS ===\n');
        console.log('Đọc comment trong file deploy.js để biết quy trình đầy đủ.');
        console.log('Nginx config: 91/nginx.conf\n');
        console.log('Chạy deploy thực tế trên VPS:');
        console.log('  node 91/deploy.js --deploy');
        console.log('\nBiến môi trường:');
        console.log('  APP_DIR=/home/deploy/app/nodejs');
        console.log('  DEPLOY_BRANCH=main');
        console.log('  ENTRY_FILE=84/graceful-shutdown.js');
    }
}

module.exports = { deploy, CONFIG };
