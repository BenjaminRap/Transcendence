import jwt from 'jsonwebtoken';
import type { TokenPair, TokenKey } from '../types/tokenManager.types.js';
import { CommonSchema } from "@shared/common.schema";

export class TokenManager {
    constructor(
        private accessSecret: string,
        private refreshSecret: string
    ) {
        // Nettoie périodiquement la blacklist pour éviter qu'elle ne grandisse indéfiniment
        setInterval(() => this.cleanupBlacklist(), 1000 * 60 * 60); // Toutes les heures
    }

    // Map<token, expiration_timestamp_in_ms>
    private blacklistedTokens: Map<string, number> = new Map();
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
    verify(token: string, isRefresh: boolean = false): any {
        const secret = isRefresh ? this.refreshSecret : this.accessSecret;
        
        if (!CommonSchema.jwt.safeParse(token) || this.blacklistedTokens.has(token)) {
            return false;
        }

        try {
            return jwt.verify(token, secret);
        } catch (error) {
            return false;
        }
    }

    // --------------------------------------------------------------------------------- //
    //  Ajoute un jeton à la liste noire pour le révoquer avant son expiration.
    revokeToken(token: string): void {
        if (!token) return;
        try {
            const decoded = jwt.decode(token) as { exp: number };
            if (decoded && decoded.exp) {
                // On stocke le jeton et sa date d'expiration en millisecondes
                this.blacklistedTokens.set(token, decoded.exp * 1000);
            }
        } catch (error) {
            console.error("Error decoding token for blacklist:", error);
        }
    }

    // --------------------------------------------------------------------------------- //
    // Nettoie la blacklist en supprimant les jetons expirés.
    private cleanupBlacklist(): void {
        const now = Date.now();
        for (const [token, expiry] of this.blacklistedTokens.entries()) {
            if (expiry < now) {
                this.blacklistedTokens.delete(token);
            }
        }
    }
}
