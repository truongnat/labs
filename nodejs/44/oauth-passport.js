// Bài 44: Login bằng OAuth2 (Passport.js) — demo mock không cần Google/GitHub thật
// OAuth2 ủy quyền cho app truy cập profile user mà không lưu password
// Chạy bằng lệnh: cd 44 && npm install && node oauth-passport.js

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: OAuth2Strategy } = require('passport-oauth2');

const app = express();
const PORT = process.env.PORT || 3044;

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'oauth-demo-secret',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());

// Mock OAuth2 provider — mô phỏng Google/GitHub callback
const MOCK_USERS = {
    mock_code_alice: { id: 'gh_1', displayName: 'Alice Dev', email: 'alice@github.mock' },
    mock_code_bob: { id: 'gh_2', displayName: 'Bob Coder', email: 'bob@github.mock' },
};

// Passport serialize — lưu user id vào session (nhẹ, không lưu cả object)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    const user = Object.values(MOCK_USERS).find((u) => u.id === id);
    done(null, user || null);
});

// Mock OAuth2 Strategy — thay bằng GitHubStrategy/GoogleStrategy khi có clientId thật
passport.use(
    new OAuth2Strategy(
        {
            authorizationURL: 'http://localhost:' + PORT + '/mock/oauth/authorize',
            tokenURL: 'http://localhost:' + PORT + '/mock/oauth/token',
            clientID: 'mock-client-id',
            clientSecret: 'mock-client-secret',
            callbackURL: 'http://localhost:' + PORT + '/auth/callback',
        },
        (accessToken, refreshToken, profile, done) => {
            // Trong thực tế: gọi API provider lấy profile, upsert user vào DB
            const mockProfile = MOCK_USERS[accessToken] || MOCK_USERS.mock_code_alice;
            done(null, mockProfile);
        }
    )
);

// Trang chủ
app.get('/', (req, res) => {
    if (req.user) {
        return res.json({
            message: 'Đã đăng nhập qua OAuth2 (mock)',
            user: req.user,
            logout: '/auth/logout',
        });
    }
    res.json({
        message: 'OAuth2 Passport demo',
        login: '/auth/github',
        hint: 'Mock flow — không cần Google/GitHub credentials',
    });
});

// Bắt đầu OAuth flow
app.get('/auth/github', passport.authenticate('oauth2'));

// Callback sau khi user "authorize"
app.get(
    '/auth/callback',
    passport.authenticate('oauth2', { failureRedirect: '/?error=auth_failed' }),
    (req, res) => {
        res.redirect('/');
    }
);

app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Đã đăng xuất' });
    });
});

// --- Mock OAuth provider endpoints (thay provider thật) ---

app.get('/mock/oauth/authorize', (req, res) => {
    const redirectUri = req.query.redirect_uri;
    const state = req.query.state || '';
    const code = 'mock_code_alice';
    res.redirect(`${redirectUri}?code=${code}&state=${state}`);
});

app.post('/mock/oauth/token', express.urlencoded({ extended: true }), (req, res) => {
    const { code } = req.body;
    res.json({
        access_token: code || 'mock_code_alice',
        token_type: 'bearer',
        expires_in: 3600,
    });
});

app.listen(PORT, () => {
    console.log(`OAuth2 Passport mock: http://localhost:${PORT}`);
    console.log('Mở browser: http://localhost:' + PORT + '/auth/github');
});
