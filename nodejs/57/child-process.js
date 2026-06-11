// Bài 57: Child Process - chạy lệnh Shell và script Python từ Node.js
// exec(): buffer output (phù hợp lệnh ngắn) | spawn(): stream output (lệnh dài)
// Chạy bằng lệnh: node child-process.js

const { exec, spawn, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

// --- 1. exec() - chạy lệnh shell, trả về stdout/stderr qua callback ---
function runExec() {
    return new Promise((resolve, reject) => {
        console.log('\n=== exec(): lệnh shell ngắn ===');

        exec('echo "Hello từ Shell" && node --version', (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            if (stderr) console.error('stderr:', stderr);
            console.log('stdout:', stdout.trim());
            resolve();
        });
    });
}

// --- 2. spawn() - stream output realtime, không giới hạn buffer ---
function runSpawn() {
    return new Promise((resolve, reject) => {
        console.log('\n=== spawn(): stream output ===');

        const child = spawn('ls', ['-la', __dirname], { shell: true });

        child.stdout.on('data', (data) => {
            process.stdout.write(data);
        });

        child.stderr.on('data', (data) => {
            console.error('stderr:', data.toString());
        });

        child.on('close', (code) => {
            console.log(`spawn kết thúc với code: ${code}`);
            resolve();
        });

        child.on('error', reject);
    });
}

// --- 3. spawn Python script (fallback nếu không có python3) ---
function runPythonScript() {
    return new Promise((resolve) => {
        console.log('\n=== spawn(): chạy script Python ===');

        const scriptPath = path.join(__dirname, 'calc.py');
        fs.writeFileSync(scriptPath, `
import sys
a = int(sys.argv[1])
b = int(sys.argv[2])
print(f"Tổng {a} + {b} = {a + b}")
`);

        const python = spawn('python3', [scriptPath, '10', '32']);

        let output = '';
        python.stdout.on('data', (data) => {
            output += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                console.log('Python output:', output.trim());
            } else {
                console.log('python3 không có sẵn - dùng node thay thế demo');
                console.log('Tổng 10 + 32 = 42');
            }
            fs.unlinkSync(scriptPath);
            resolve();
        });

        python.on('error', () => {
            console.log('python3 không cài - bỏ qua demo Python');
            if (fs.existsSync(scriptPath)) fs.unlinkSync(scriptPath);
            resolve();
        });
    });
}

// --- 4. execFile() - chạy file trực tiếp không qua shell (an toàn hơn) ---
function runExecFile() {
    return new Promise((resolve, reject) => {
        console.log('\n=== execFile(): chạy node trực tiếp ===');

        const script = path.join(__dirname, 'mini.js');
        fs.writeFileSync(script, 'console.log("Mini script chạy qua execFile");');

        execFile('node', [script], (error, stdout) => {
            fs.unlinkSync(script);
            if (error) {
                reject(error);
                return;
            }
            console.log(stdout.trim());
            resolve();
        });
    });
}

async function main() {
    await runExec();
    await runSpawn();
    await runPythonScript();
    await runExecFile();
    console.log('\nHoàn thành tất cả demo child process');
}

main().catch(console.error);
