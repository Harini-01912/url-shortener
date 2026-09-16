const authService =
    require("../services/authService");

exports.register = async (
    req,
    res
) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user =
            await authService.register(
                email,
                password
            );

        res.status(201).json(user);

    } catch(err) {

        res.status(400).json({
            error: err.message
        });

    }
};
exports.login = async (
    req,
    res
) => {

    try {

        const {
            email,
            password
        } = req.body;

        const result =
            await authService.login(
                email,
                password
            );

        res.json(result);

    } catch(err) {

        res.status(401).json({
            error: err.message
        });

    }
};
exports.getMyUrls =
    async (
        req,
        res
    ) => {

    const urls =
        await authService
            .getMyUrls(
                req.user.userId
            );

    res.json(urls);
};