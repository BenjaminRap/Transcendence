import jwt from 'jsonwebtoken';
import { CommonSchema } from '../schemas/common.schema.js';
export class TokenManager {
    constructor(accessSecret, refreshSecret) {
        this.accessSecret = accessSecret;
        this.refreshSecret = refreshSecret;
        this.accessExpiry = '15h';
        this.refreshExpiry = '7days';
    }
    // --------------------------------------------------------------------------------- //
    async generatePair(userId, email) {
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
    async generateUnique(userId, email, timeValidity) {
        const payload = { userId, email };
        const uniqueToken = jwt.sign(payload, this.accessSecret, {
            algorith: 'HS256',
            expiresIn: timeValidity,
        });
        return String(uniqueToken);
    }
    // --------------------------------------------------------------------------------- //
    verify(token, isRefresh = false) {
        const secret = isRefresh ? this.refreshSecret : this.accessSecret;
        if (!CommonSchema.jwt.safeParse(token))
            return false;
        return jwt.verify(token, secret);
    }
}
