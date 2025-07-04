// Global type declarations for the application
import * as admin from 'firebase-admin';

// Extend Express Request interface to include 'user' and 'firebaseUser'
declare module 'express-serve-static-core' {
    interface Request {
        user?: { user_id: number; [key: string]: any };
        firebaseUser?: admin.auth.DecodedIdToken;
    }
}

// Export empty object to make this a module
export {};
