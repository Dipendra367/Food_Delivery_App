const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_dev';

module.exports = function (req, res, next) {
    // Get token from header
    const authHeader = req.header('Authorization');

    // Check if Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Check if format is Bearer <token>
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Invalid token format. Use Bearer <token>' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
