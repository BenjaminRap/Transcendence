import jwt from 'jsonwebtoken';

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class TokenManager {
    constructor(
        private accessSecret: string,
        private refreshSecret: string
    ) {}

    private accessExpiry: string = '15m';
    private refreshExpiry: string = '7d';
    
    async generate(userId: string, email: string): Promise<TokenPair> {
        const payload = { userId, email };

        const accessToken = jwt.sign(payload, this.accessSecret, {
            expiresIn: this.accessExpiry,
        });

        const refreshToken = jwt.sign(payload, this.refreshSecret, {
            expiresIn: this.refreshExpiry,
        });

        return { accessToken, refreshToken };
    }

    verify(token: string, isRefresh: boolean = false): any {
        const secret = isRefresh ? this.refreshSecret : this.accessSecret;
        return jwt.verify(token, secret);
    }
}