import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

interface UserPayload {
  userId: number;
  username: string;
}

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Alias for compatibility with memes.ts
export const requireAuth = authenticate;
