const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWT_SECRET || 'default_secret_key';

//Проверяем, есть ли у нас токен в заголовке

const authToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized: No authorization header provided' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (!token || bearer.toLowerCase() !== 'bearer') {
        return res.status(401).json({ error: 'Unauthorized: Invalid authorization header format' });
    }

    console.log('Received token:', token);

    try {
        const decoded = jwt.verify(token, jwtSecretKey);
        req.user = decoded;

        // console.log('Decoded token:', decoded);

        // Продолжаем выполнение следующего middleware
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = authToken;
