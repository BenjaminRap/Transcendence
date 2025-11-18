import { PrismaClient, User } from '@prisma/client';
import { PasswordHasher } from '../utils/PasswordHasher.js';
import { TokenManager } from '../utils/TokenManager.js';
import { TokenPair, TokenKey } from '../types/tokenManager.types.js';
import { AuthException, AuthError } from '../error_handlers/Auth.error.js';
import { RegisterData, sanitizeUser, SanitizedUser } from '../types/auth.types.js';
import { fr } from 'zod/v4/locales';

export class AuthService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
        private tokenManager: TokenManager
    ) {}

    // --------------------------------------------------------------------------------- //
    async register(data: RegisterData): Promise<{ user: SanitizedUser; tokens: TokenPair }> {
        // check if the user already exist
        const existing = await this.findByEmailOrUsername(data.email, data.username);

        if (existing) {
            if (existing.email === data.email)
                throw new AuthException(AuthError.EMAIL_TAKEN, AuthError.EMAIL_TAKEN);
            else 
                throw new AuthException(AuthError.USERNAME_TAKEN, AuthError.USERNAME_TAKEN);
        }

        const hashedPassword = await this.passwordHasher.hash(data.password);

        if (data.avatar) {
            /**
             * appeler le controller et lui laisser assurer la securite vis a vis
             * gerer la mise a jour de l'avatar suivant le retour du controller
             * 
            */
           
        }

        // create user in the DB
        const user = await this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                avatar: data.avatar,
            },
        });

        const tokens = await this.tokenManager.generatePair(String(user.id), user.email);

        return {
            user: sanitizeUser(user),
            tokens,
        };
    }

    // --------------------------------------------------------------------------------- //
    async login(identifier: string, password: string): Promise<{ user: SanitizedUser; tokens: TokenPair }> {
        // Find the user
        const user = await this.findByEmailOrUsername(identifier, identifier);
        if (!user) {
            throw new AuthException(AuthError.INVALID_CREDENTIALS, AuthError.INVALID_CREDENTIALS);
        }

        // verify password
        const isValid = await this.passwordHasher.verify(password, user.password);
        if (!isValid) {
            throw new AuthException(AuthError.INVALID_CREDENTIALS, AuthError.INVALID_CREDENTIALS);
        }

        // generate JWT tokens for the session
        const tokens = await this.tokenManager.generatePair(String(user.id), user.email);

        return {
            user: sanitizeUser(user),
            tokens,
        };
    }

    // --------------------------------------------------------------------------------- //
    async refreshTokens(userId: string, email: string): Promise<TokenPair> {
        // check if user exist
        if ( !await this.findById(Number(userId)) ) {
            throw new AuthException(AuthError.USR_NOT_FOUND, AuthError.USR_NOT_FOUND);
        }
        return await this.tokenManager.generatePair(userId, email);
    }

    // --------------------------------------------------------------------------------- //
    async verifyPassword(userId: number, password: string): Promise<TokenKey> {
        const user = await this.findById(Number(userId));
        if (!user) {
            throw new AuthException(AuthError.USR_NOT_FOUND, AuthError.USR_NOT_FOUND);
        }
        
        if ( !await this.passwordHasher.verify(password, user.password) ) {
            throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Invalid password');
        }
        
        return await this.tokenManager.generateUnique(String(user.id), user.email, "5m");
    }

    // ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    private async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
        if (!user?.id) {
            return null;
        }
        return user;
    }

    // --------------------------------------------------------------------------------- //
    private async findById(id: number): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });
        if (!user?.id) {
            return null;
        }
        return user;
    }
}
