import { PrismaClient, User } from '@prisma/client';
import { RegisterData, SanitizedUser } from '../types/auth.types.js';
import { PasswordHasher } from '../utils/passwordHasher.js';
import { TokenManager } from '../utils/tokenManager.js';

export class AuthService {
    constructor(
        private prisma: PrismaClient,
        private passwordHasher: PasswordHasher,
        private tokenManager: TokenManager
    ) {}

    // --------------------------------------------------------------------------------- //

    async register(data: RegisterData): Promise<{ user: SanitizedUser; tokens: any }> {
        // check if the user already exist
        const existing = await this.findByEmailOrUsername(data.email, data.username);
        if (existing) {
            throw new Error('User already exists');
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
            user: this.sanitizeUser(user),
            tokens,
        };
    }

    // --------------------------------------------------------------------------------- //

    async login(identifier: string, password: string): Promise<{ user: SanitizedUser; tokens: any }> {
        // Find the user
        const user = await this.findByEmailOrUsername(identifier, identifier);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValid = await this.passwordHasher.verify(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        // generate JWT tokens for the session
        const tokens = await this.tokenManager.generate(user.id, user.email);

        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }

    // --------------------------------------------------------------------------------- //

    async refreshTokens(userId: string, email: string): Promise<any> {
        return await this.tokenManager.generate(userId, email);
    }

    // ==================================== PRIVATE ==================================== //

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

    private sanitizeUser(user: User): SanitizedUser {
        return {
            id: user.id,
            username: user.username,
            avatar: user.avatar
        } as SanitizedUser;
    }
}
