import { PrismaClient, User } from '@prisma/client';
import { RegisterData, sanitizeUser, SanitizedUser } from '../types/auth.types.js';
import { PasswordHasher } from '../utils/passwordHasher.js';
import { TokenManager, TokenPair } from '../utils/tokenManager.js';

export enum AuthError {
    USR_NOT_FOUND = 'User not found',
    USERNAME_TAKEN = 'username already taken',
    EMAIL_TAKEN = 'email already registered',
    INVALID_CREDENTIALS= 'Invalid credentials' 
}

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
                throw new Error(AuthError.EMAIL_TAKEN);
            else 
                throw new Error(AuthError.USERNAME_TAKEN);
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

        const tokens = await this.tokenManager.generate(user.id, user.email);

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
            throw new Error(AuthError.INVALID_CREDENTIALS);
        }

        const isValid = await this.passwordHasher.verify(password, user.password);
        if (!isValid) {
            throw new Error(AuthError.INVALID_CREDENTIALS);
        }

        // generate JWT tokens for the session
        const tokens = await this.tokenManager.generate(user.id, user.email);

        return {
            user: sanitizeUser(user),
            tokens,
        };
    }

    // --------------------------------------------------------------------------------- //
    async refreshTokens(userId: string, email: string): Promise<TokenPair> {
        // check if user exist
        if (!await this.findById(Number(userId))) {
            throw new Error(AuthError.USR_NOT_FOUND);
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
