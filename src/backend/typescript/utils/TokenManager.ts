import jwt from 'jsonwebtoken';
import type { TokenPair, TokenKey } from '../types/tokenManager.types.js';
import { CommonSchema } from "@shared/common.schema";

export class TokenManager {
    constructor(
        private accessSecret: string,
        private refreshSecret: string
    ) {}

    private accessExpiry: string = '15h';
    private refreshExpiry: string = '7days';
    
    // --------------------------------------------------------------------------------- //
    async generatePair(userId: string, email: string): Promise<TokenPair> {
        const payload = { userId, email };

        const accessToken = (jwt as any).sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiry,
        });

        const refreshToken = (jwt as any).sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiry,
        });

        return { accessToken, refreshToken };
    }

    // --------------------------------------------------------------------------------- //
    async generateUnique(userId: string, email: string, timeValidity: string): Promise<TokenKey> {
        const payload = { userId, email };

        const uniqueToken = (jwt as any).sign(payload, this.accessSecret, {
            algorith: 'HS256',
            expiresIn: timeValidity,
        });

        return String(uniqueToken);
    }

    // --------------------------------------------------------------------------------- //
    verify(token: string, isRefresh: boolean = false): any {
        const secret = isRefresh ? this.refreshSecret : this.accessSecret;
        
        if (!CommonSchema.jwt.safeParse(token))
            return false;

        return jwt.verify(token, secret);
    }
}
