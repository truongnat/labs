// Bài 97: Video Streaming HLS + FFmpeg Transcode Queue (demo đơn giản)
// Queue transcode mô phỏng FFmpeg, phục vụ playlist .m3u8 và segment .ts
// Chạy bằng lệnh: node video-streaming-hls.js
// Demo: curl http://localhost:3097/api/videos  |  curl http://localhost:3097/hls/demo/playlist.m3u8

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 3097;
const MEDIA_DIR = path.join(__dirname, 'media');
const HLS_DIR = path.join(MEDIA_DIR, 'hls');

// === Transcode job queue (mô phỏng BullMQ) ===
const transcodeQueue = [];
const transcodeJobs = new Map();
let processingTranscode = false;

const videos = new Map([
    ['demo', {
        id: 'demo',
        title: 'Node.js Streaming Demo',
        duration: 10,
        status: 'ready',
        qualities: ['360p']
    }]
]);

function ensureDirs() {
    fs.mkdirSync(HLS_DIR, { recursive: true });
}

// Tạo HLS demo không cần FFmpeg (segment giả lập)
function generateDemoHls(videoId) {
    const outDir = path.join(HLS_DIR, videoId);
    fs.mkdirSync(outDir, { recursive: true });

    const segmentCount = 3;
    const segmentDuration = 4;

    for (let i = 0; i < segmentCount; i++) {
        const segPath = path.join(outDir, `seg${i}.ts`);
        if (!fs.existsSync(segPath)) {
            // Segment TS giả: header sync byte 0x47 (MPEG-TS)
            const payload = Buffer.alloc(188, 0x00);
            payload[0] = 0x47;
            payload.write(`DEMO-SEG-${i}`, 4, 'utf8');
            fs.writeFileSync(segPath, payload);
        }
    }

    const playlist = [
        '#EXTM3U',
        '#EXT-X-VERSION:3',
        '#EXT-X-TARGETDURATION:4',
        ...Array.from({ length: segmentCount }, (_, i) => [
            `#EXTINF:${segmentDuration}.0,`,
            `seg${i}.ts`
        ]).flat(),
        '#EXT-X-ENDLIST',
        ''
    ].join('\n');

    fs.writeFileSync(path.join(outDir, 'playlist.m3u8'), playlist);
    return outDir;
}

function enqueueTranscode(videoId, sourcePath) {
    const job = {
        id: randomUUID(),
        videoId,
        sourcePath,
        status: 'queued',
        progress: 0,
        createdAt: new Date().toISOString(),
        finishedAt: null,
        mode: 'simulated'
    };

    transcodeJobs.set(job.id, job);
    transcodeQueue.push(job.id);
    processTranscodeQueue();
    return job;
}

async function processTranscodeQueue() {
    if (processingTranscode || transcodeQueue.length === 0) return;
    processingTranscode = true;

    const jobId = transcodeQueue.shift();
    const job = transcodeJobs.get(jobId);
    job.status = 'processing';

    const ffmpegAvailable = await checkFfmpeg();

    try {
        if (ffmpegAvailable && job.sourcePath && fs.existsSync(job.sourcePath)) {
            job.mode = 'ffmpeg';
            await runFfmpegTranscode(job);
        } else {
            job.mode = 'simulated';
            await simulateTranscode(job);
        }

        job.status = 'completed';
        job.progress = 100;
        job.finishedAt = new Date().toISOString();

        const video = videos.get(job.videoId) || { id: job.videoId, title: job.videoId };
        video.status = 'ready';
        videos.set(job.videoId, video);

        console.log(`[Transcode] ✓ ${job.videoId} (${job.mode})`);
    } catch (err) {
        job.status = 'failed';
        job.error = err.message;
        console.error(`[Transcode] ✗ ${job.videoId}:`, err.message);
    } finally {
        processingTranscode = false;
        processTranscodeQueue();
    }
}

function checkFfmpeg() {
    return new Promise((resolve) => {
        const proc = spawn('ffmpeg', ['-version']);
        proc.on('error', () => resolve(false));
        proc.on('close', (code) => resolve(code === 0));
    });
}

function simulateTranscode(job) {
    return new Promise((resolve) => {
        let step = 0;
        const timer = setInterval(() => {
            step += 25;
            job.progress = Math.min(step, 100);
            if (step >= 100) {
                clearInterval(timer);
                generateDemoHls(job.videoId);
                resolve();
            }
        }, 400);
    });
}

function runFfmpegTranscode(job) {
    return new Promise((resolve, reject) => {
        const outDir = path.join(HLS_DIR, job.videoId);
        fs.mkdirSync(outDir, { recursive: true });
        const playlist = path.join(outDir, 'playlist.m3u8');

        const args = [
            '-y', '-i', job.sourcePath,
            '-codec:v', 'libx264', '-codec:a', 'aac',
            '-hls_time', '4', '-hls_list_size', '0',
            '-f', 'hls', playlist
        ];

        const proc = spawn('ffmpeg', args);
        proc.stderr.on('data', (d) => {
            const text = d.toString();
            if (text.includes('time=')) job.progress = Math.min(job.progress + 5, 95);
        });
        proc.on('error', reject);
        proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
    });
}

// Khởi tạo demo HLS sẵn
ensureDirs();
generateDemoHls('demo');

function sendJson(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => {
            try { resolve(data ? JSON.parse(data) : {}); }
            catch { reject(new Error('JSON không hợp lệ')); }
        });
        req.on('error', reject);
    });
}

function serveFile(res, filePath, contentType) {
    if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=60' });
    fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    try {
        if (req.method === 'GET' && url.pathname === '/api/videos') {
            return sendJson(res, 200, { videos: [...videos.values()] });
        }

        if (req.method === 'POST' && url.pathname === '/api/transcode') {
            const body = await readBody(req);
            const videoId = body.videoId || `vid-${Date.now()}`;
            videos.set(videoId, {
                id: videoId,
                title: body.title || videoId,
                status: 'processing',
                qualities: []
            });
            const job = enqueueTranscode(videoId, body.sourcePath || null);
            return sendJson(res, 202, { message: 'Đã đưa vào transcode queue', job });
        }

        if (req.method === 'GET' && url.pathname.startsWith('/api/transcode/')) {
            const jobId = url.pathname.split('/').pop();
            const job = transcodeJobs.get(jobId);
            if (!job) return sendJson(res, 404, { error: 'Job không tồn tại' });
            return sendJson(res, 200, job);
        }

        // Phục vụ HLS: /hls/:videoId/playlist.m3u8 hoặc segment .ts
        const hlsMatch = url.pathname.match(/^\/hls\/([^/]+)\/(.+)$/);
        if (req.method === 'GET' && hlsMatch) {
            const [, videoId, file] = hlsMatch;
            const filePath = path.join(HLS_DIR, videoId, file);

            if (file.endsWith('.m3u8')) {
                return serveFile(res, filePath, 'application/vnd.apple.mpegurl');
            }
            if (file.endsWith('.ts')) {
                return serveFile(res, filePath, 'video/mp2t');
            }
        }

        if (req.method === 'GET' && url.pathname === '/health') {
            return sendJson(res, 200, {
                status: 'ok',
                queueLength: transcodeQueue.length,
                hlsDemo: `http://localhost:${PORT}/hls/demo/playlist.m3u8`
            });
        }

        sendJson(res, 404, {
            error: 'Not found',
            routes: [
                'GET /api/videos',
                'POST /api/transcode { videoId?, title?, sourcePath? }',
                'GET /hls/:videoId/playlist.m3u8'
            ]
        });
    } catch (err) {
        sendJson(res, 400, { error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`HLS Streaming + Transcode Queue chạy tại http://localhost:${PORT}`);
    console.log(`Playlist demo: http://localhost:${PORT}/hls/demo/playlist.m3u8`);
    console.log('POST /api/transcode để enqueue job (FFmpeg nếu có, không thì simulate)');
});
