import { PrismaClient, User } from '@prisma/client';
import { PasswordHasher } from '../utils/PasswordHasher.js';
import { TokenManager, TokenPair } from '../utils/TokenManager.js';
import { AuthException, AuthError } from '../error_handlers/Auth.error.js';
import { RegisterData, sanitizeUser, SanitizedUser } from '../types/auth.types.js';

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

        // create user in the DB
        const user = await this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword,
                avatar: data.avatar || null,
            },
        });

        const tokens = await this.tokenManager.generate(String(user.id), user.email);

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
            throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Invalid email or username');
        }

        // verify password
        const isValid = await this.passwordHasher.verify(password, user.password);
        if (!isValid) {
            throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Invalid password');
        }

        // generate JWT tokens for the session
        const tokens = await this.tokenManager.generate(String(user.id), user.email);

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
        return await this.tokenManager.generate(userId, email);
    }

    // ==================================== PRIVATE ==================================== //

    // --------------------------------------------------------------------------------- //
    private async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
        return await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                ],
            },
        });
    }

    // --------------------------------------------------------------------------------- //
    private async findById(id: number): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }
}
