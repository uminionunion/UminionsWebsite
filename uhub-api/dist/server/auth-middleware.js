import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
export const authenticate = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
export const authenticateOptional = (req, _res, next) => {
    const token = req.cookies?.token;
    if (token) {
        try {
            req.user = jwt.verify(token, JWT_SECRET);
        }
        catch {
            req.user = undefined;
        }
    }
    next();
};
// Alias for compatibility with memes.ts
export const requireAuth = authenticate;
