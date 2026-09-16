const { nanoid } = require("nanoid");
const urlRepository = require("../repositories/urlRepository");
const redisClient = require("../config/redis");

exports.createShortUrl = async (
    originalUrl,
    customAlias,
    expiresAt,
    userId
) => {

    let shortCode;

    if (customAlias) {

        const existing = await urlRepository.findByAlias(
            customAlias
        );

        if (existing) {
            throw new Error(
                "Alias already exists"
            );
        }

        shortCode = customAlias;

    } else {
        shortCode = nanoid(6);
    }

    const savedUrl = await urlRepository.saveUrl(
        originalUrl,
        shortCode,
        expiresAt,
        userId
    );

    return {
        shortUrl:
            `${process.env.BASE_URL}/${savedUrl.short_code}`
    };
};

exports.getOriginalUrl = async (shortCode) => {

    // 1. Check Redis first
    const cachedUrl = await redisClient.get(
        shortCode
    );

    if (cachedUrl) {

        console.log(
            `Cache Hit: ${shortCode}`
        );

        await urlRepository.incrementClickCount(
            shortCode
        );

        return cachedUrl;
    }

    console.log(
        `Cache Miss: ${shortCode}`
    );

    // 2. Fetch from PostgreSQL
    const url = await urlRepository.findByShortCode(
        shortCode
    );

    if (!url) {
        throw new Error(
            "Short URL not found"
        );
    }

    // 3. Expiration check
    if (
        url.expires_at &&
        new Date(url.expires_at) < new Date()
    ) {
        throw new Error(
            "This short URL has expired"
        );
    }

    // 4. Store in Redis for 1 hour
    await redisClient.set(
        shortCode,
        url.original_url,
        {
            EX: 3600
        }
    );

    // 5. Increment analytics
    await urlRepository.incrementClickCount(
        shortCode
    );

    return url.original_url;
};

exports.getStats = async (shortCode) => {

    const url = await urlRepository.getStats(
        shortCode
    );

    if (!url) {
        throw new Error(
            "Short URL not found"
        );
    }

    return url;
};