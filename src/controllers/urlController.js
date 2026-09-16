const urlService = require("../services/urlService");

exports.createShortUrl = async (req, res) => {
    try {
        const {
            url,
            customAlias,
            expiresAt
        } = req.body;

        const userId = req.user.userId;

        const result = await urlService.createShortUrl(
            url,
            customAlias,
            expiresAt,
            userId
        );

        res.status(201).json(result);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};

exports.redirectToOriginalUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;

        const originalUrl =
            await urlService.getOriginalUrl(shortCode);

        res.redirect(originalUrl);

    } catch (err) {

        if (err.message === "This short URL has expired") {
            return res.status(410).json({
                error: err.message
            });
        }

        res.status(404).json({
            error: err.message
        });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await urlService.getStats(
            req.params.shortCode
        );

        res.json(stats);

    } catch (err) {
        res.status(404).json({
            error: err.message
        });
    }
};