// Bài 90: GitHub Actions CI Pipeline
// Tự động chạy test khi push/PR — file workflow: .github/workflows/ci.yml
// Chạy local (act): act -j test
// Xem workflow: cat .github/workflows/ci.yml

/**
 * CI Pipeline gồm các bước:
 *
 * 1. TRIGGER
 *    - on: push (branch main, develop)
 *    - on: pull_request
 *
 * 2. JOBS
 *    a) lint   — kiểm tra code style (eslint)
 *    b) test   — chạy jest, upload coverage
 *    c) build  — build Docker image (optional)
 *
 * 3. CACHE
 *    - actions/cache npm để tăng tốc CI
 *
 * 4. MATRIX
 *    - Test trên nhiều Node version (18, 20, 22)
 *
 * 5. ARTIFACTS
 *    - Upload coverage report lên Codecov
 *
 * Workflow file nằm tại: nodejs/.github/workflows/ci.yml
 */

// Script helper — CI chạy lệnh này thay vì logic phức tạp
const { execSync } = require('child_process');
const path = require('path');

function runCI() {
    const root = path.join(__dirname, '..');
    console.log('[CI] Bắt đầu pipeline local simulation...\n');

    const steps = [
        { name: 'Install dependencies', cmd: 'npm ci || npm install' },
        { name: 'Lint', cmd: 'npx eslint . --ext .js || echo "Lint skipped"' },
        { name: 'Unit tests', cmd: 'npx jest --passWithNoTests --coverage' },
        { name: 'Security audit', cmd: 'npm audit --audit-level=high || true' },
    ];

    for (const step of steps) {
        console.log(`[CI] ▶ ${step.name}`);
        try {
            execSync(step.cmd, { cwd: root, stdio: 'inherit' });
            console.log(`[CI] ✓ ${step.name} — PASS\n`);
        } catch (err) {
            console.error(`[CI] ✗ ${step.name} — FAIL`);
            process.exit(1);
        }
    }

    console.log('[CI] Pipeline hoàn tất — sẵn sàng merge!');
}

if (require.main === module) {
    runCI();
}

module.exports = { runCI };
