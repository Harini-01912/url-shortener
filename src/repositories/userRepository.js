const pool = require("../config/db");

exports.findByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT *
        FROM users
        WHERE email = $1
        `,
        [email]
    );

    return result.rows[0];
};

exports.createUser = async (
    email,
    passwordHash
) => {
    const result = await pool.query(
        `
        INSERT INTO users(
            email,
            password_hash
        )
        VALUES($1,$2)
        RETURNING id,email,created_at
        `,
        [email, passwordHash]
    );

    return result.rows[0];
};
exports.findUrlsByUserId =
    async (userId) => {

    const result =
        await pool.query(
            `
            SELECT *
            FROM urls
            WHERE user_id = $1
            ORDER BY created_at DESC
            `,
            [userId]
        );

    return result.rows;
};