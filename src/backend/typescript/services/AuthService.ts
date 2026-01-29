import { PrismaClient, type User } from '@prisma/client';
import { PasswordHasher } from '../utils/PasswordHasher.js';
import { TokenManager } from '../utils/TokenManager.js';
import { type TokenPair } from '../types/tokenManager.types.js';
import { AuthException, AuthError } from '../error_handlers/Auth.error.js';
import { type RegisterData, sanitizeUser } from '../types/auth.types.js';
import type { SanitizedUser } from '@shared/ZodMessageType.js';
import { CommonSchema } from '@shared/common.schema.js';

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
                avatar: process.env.DEFAULT_AVATAR_URL || "api/static/public/avatarDefault.webp",
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
            throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Invalid email or username');
        }

        // verify password
        const isValid = await this.passwordHasher.verify(password, user.password);
        if (!isValid) {
            throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Invalid password');
        }

        // generate JWT tokens for the session
        const tokens = await this.tokenManager.generatePair(String(user.id), user.email);

        return {
            user: sanitizeUser(user),
            tokens,
        };
    }

    // --------------------------------------------------------------------------------- //
    async loginWith42(code: string): Promise<{ user: SanitizedUser; tokens: TokenPair; msg: string }> {
        const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.FORTY_TWO_UID || "",
                client_secret: process.env.FORTY_TWO_SECRET || "",
                code,
                redirect_uri: process.env.FORTY_TWO_CALLBACK_URL || "",
            }),
        });

        if (!tokenResponse.ok) {
            throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json() as any;
		const accessToken = tokenData.access_token;

        const userResponse = await fetch('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!userResponse.ok) {
            throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Failed to fetch 42 user info');
        }

        const userData = await userResponse.json() as any;

        let user = await this.findByEmailOrUsername(userData.email, userData.login);
		let msg = '';
        if (!user) {
            if (CommonSchema.username.safeParse(userData.login).success === false) {
                throw new AuthException(AuthError.INVALID_CREDENTIALS, 'Your 42 login is not a valid username for our platform (contain invalid characters)');
            }

            user = await this.prisma.user.create({
                data: {
                    username: userData.login,
                    email: userData.email,
                    password: '',
                    avatar: userData.image?.link || "api/static/public/avatarDefault.webp",
                },
            });
			msg = 'New user created and logged in with 42';
        }
        else {
            if (user.email !== userData.email) {
                console.error(`Username collision for ${userData.login}. DB email: ${user.email}, 42 email: ${userData.email}`);
                throw new AuthException(AuthError.USERNAME_TAKEN, 'This username is already taken by another user');
            }
        }
		if (msg === '') {
			msg = 'User logged in with 42';
        }

        const tokens = await this.tokenManager.generatePair(String(user.id), user.email);

        return {
            user: sanitizeUser(user),
            tokens,
			msg,
        };
    }

    // --------------------------------------------------------------------------------- //
    async refreshTokens(userId: string, email: string): Promise<TokenPair> {
        if ( !CommonSchema.id.safeParse(userId).success )
            throw new AuthException(AuthError.INVALID_CREDENTIALS, AuthError.INVALID_CREDENTIALS)

        // check if user exist
        if ( !await this.findById(Number(userId)) ) {
            throw new AuthException(AuthError.USR_NOT_FOUND, AuthError.USR_NOT_FOUND);
        }
        return await this.tokenManager.generatePair(String(userId), email);
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

        return user?.id ? user : null;
    }

    // --------------------------------------------------------------------------------- //
    private async findById(id: number): Promise<User | null> {
        if ( ! CommonSchema.id.safeParse(id).success )
            return null;

        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });

        return user ? user : null;
    }
}
