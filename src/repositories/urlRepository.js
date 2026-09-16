const pool = require("../config/db");

exports.saveUrl = async (
    originalUrl,
    shortCode,
    expiresAt,
    userId
) => {
    const query = `
        INSERT INTO urls (
            original_url,
            short_code,
            expires_at,
            user_id
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;

    const values = [
        originalUrl,
        shortCode,
        expiresAt || null,
        userId
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

exports.findByShortCode = async (shortCode) => {
    const query = `
        SELECT *
        FROM urls
        WHERE short_code = $1
    `;

    const result = await pool.query(
        query,
        [shortCode]
    );

    return result.rows[0];
};

exports.incrementClickCount = async (
    shortCode
) => {
    const query = `
        UPDATE urls
        SET click_count = click_count + 1
        WHERE short_code = $1
    `;

    await pool.query(query, [shortCode]);
};

exports.getStats = async (shortCode) => {
    const result = await pool.query(
        `
        SELECT
            original_url,
            short_code,
            click_count,
            created_at,
            expires_at,
            user_id
        FROM urls
        WHERE short_code = $1
        `,
        [shortCode]
    );

    return result.rows[0];
};

exports.findByAlias = async (alias) => {
    const result = await pool.query(
        `
        SELECT *
        FROM urls
        WHERE short_code = $1
        `,
        [alias]
    );

    return result.rows[0];
};

exports.findUrlsByUserId = async (
    userId
) => {
    const result = await pool.query(
        `
        SELECT
            id,
            original_url,
            short_code,
            click_count,
            created_at,
            expires_at
        FROM urls
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
};