const bcrypt = require("bcrypt");
const userRepository =
    require("../repositories/userRepository");
const jwt = require("jsonwebtoken");
exports.register = async (
    email,
    password
) => {

    const existingUser =
        await userRepository.findByEmail(
            email
        );

    if (existingUser) {
        throw new Error(
            "User already exists"
        );
    }

    const passwordHash =
        await bcrypt.hash(password, 10);

    const user =
        await userRepository.createUser(
            email,
            passwordHash
        );

    return user;
};
exports.login = async (
    email,
    password
) => {

    const user =
        await userRepository.findByEmail(
            email
        );

    if (!user) {
        throw new Error(
            "Invalid credentials"
        );
    }

    const isMatch =
        await bcrypt.compare(
            password,
            user.password_hash
        );

    if (!isMatch) {
        throw new Error(
            "Invalid credentials"
        );
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        token
    };
};
exports.getMyUrls =
    async (userId) => {

    return await userRepository
        .findUrlsByUserId(
            userId
        );
};