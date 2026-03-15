// backend/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";

// This is a placeholder for actual authentication middleware.
// In a real-world application, this would:
// 1. Extract a token (e.g., JWT) from the 'Authorization' header.
// 2. Validate the token.
// 3. Decode the token to get the user's information.
// 4. Attach the user object to the request (e.g., req.user).
// 5. If the token is invalid or missing, it would return a 401 Unauthorized error.

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    // For now, we'll just log a message and proceed.
    // In a real implementation, you'd have your auth logic here.
    console.log("🔒 Authenticated route. (Placeholder)");

    // Example of attaching a mock user to the request for development:
    // (req as any).user = { id: 'user-123', role: 'admin' };
    
    next();
};

export const hasRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // const user = (req as any).user;
        // if (!user || !roles.includes(user.role)) {
        //     return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
        // }
        console.log(`🛡️ Role check: requires one of [${roles.join(', ')}]. (Placeholder)`);
        next();
    };
};
