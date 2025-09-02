const jwt = require('jsonwebtoken');

const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.SECRET_REFRESH_KEY, { expiresIn: '30d' });
    return { accessToken, refreshToken };
};

const validateAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (e) {
        return null;
    }
};

const validateRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.SECRET_REFRESH_KEY);
    } catch (e) {
        return null;
    }
};

module.exports = {
    generateTokens,
    validateAccessToken,
    validateRefreshToken,
};
