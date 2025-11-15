import jwt from 'jsonwebtoken';
import { TokenPair, TokenKey } from '../types/tokenManager.types.js';

export class TokenManager {
    constructor(
        private accessSecret: string,
        private refreshSecret: string
    ) {}

    private accessExpiry: string = '15h';
    private refreshExpiry: string = '2h';
    
    // --------------------------------------------------------------------------------- //
    async generatePair(userId: string, email: string): Promise<TokenPair> {
        const payload = { userId, email };

        const accessToken = jwt.sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiry,
        });

        const refreshToken = jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiry,
        });

        return { accessToken, refreshToken };
    }

    // --------------------------------------------------------------------------------- //
    async generateUnique(userId: string, email: string, timeValidity: string): Promise<TokenKey> {
        const payload = { userId, email };

        const uniqueToken = jwt.sign(payload, this.accessSecret, {
            expiresIn: timeValidity,
        });

        return String(uniqueToken);
    }

    // --------------------------------------------------------------------------------- //
    verify(token: string, isRefresh: boolean = false): any {
        const secret = isRefresh ? this.refreshSecret : this.accessSecret;
        return jwt.verify(token, secret);
    }
}