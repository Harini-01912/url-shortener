const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const pool = require("./config/db");

const urlRoutes = require("./routes/urlRoutes");
const authRoutes = require("./routes/authRoutes");
const urlController = require("./controllers/urlController");
const {
    apiLimiter,
    authLimiter
} = require("./middlewares/rateLimitMiddleware");

const app = express();

// Render runs behind a reverse proxy
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Serve frontend
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
app.use("/api/v1/auth/register", authLimiter);
app.use("/api/v1/auth/login", authLimiter);
app.use(apiLimiter);

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes
app.use("/api/v1/urls", urlRoutes);
app.use("/api/v1/auth", authRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP'
    });
});

// Database Health Check
app.get("/db-health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.status(200).json({
            status: "Database Connected",
            time: result.rows[0].now
        });

    } catch (err) {
        res.status(500).json({
            status: "Database Connection Failed",
            error: err.message
        });
    }
});

// Redirect short URL
app.get(
    "/:shortCode",
    urlController.redirectToOriginalUrl
);

module.exports = app;