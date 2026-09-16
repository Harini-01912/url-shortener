const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error("REDIS_URL is not configured");
}

const redisClient = createClient({
    url: redisUrl,
    socket: {
        tls: true,
        rejectUnauthorized: false
    }
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err.message);
});

(async () => {
    try {
        await redisClient.connect();
        console.log("Redis Connected");
    } catch (err) {
        console.error("Failed to connect to Redis:", err.message);
    }
})();

module.exports = redisClient;