import { PrismaClient, type User } from '@prisma/client';
import { PasswordHasher } from '../utils/PasswordHasher.js';
import { TokenManager } from '../utils/TokenManager.js';
import { type TokenPair } from '../types/tokenManager.types.js';
import { AuthException, AuthError } from '../error_handlers/Auth.error.js';
import { type RegisterData, sanitizeUser } from '../types/auth.types.js';
import type { SanitizedUser } from '@shared/ServerMessage.js';

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
                avatar: process.env.DEFAULT_AVATAR_URL,
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
    // a revoir
    async loginWith42(code: string): Promise<{ user: SanitizedUser; tokens: TokenPair; msg: string }> {
        const tokenResponse = await fetch('https://api.intra.42.fr/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.FORTY_TWO_UID,
                client_secret: process.env.FORTY_TWO_SECRET,
                code,
                redirect_uri: process.env.FORTY_TWO_CALLBACK_URL,
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
            const randomPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await this.passwordHasher.hash(randomPassword);

            user = await this.prisma.user.create({
                data: {
                    username: userData.login,
                    email: userData.email,
                    password: hashedPassword,
                    avatar: userData.image?.link,
                },
            });
			msg = 'New user created and logged in with 42';
        }
		if (msg === '')
			msg = 'User logged in with 42';

        const tokens = await this.tokenManager.generatePair(String(user.id), user.email);

        return {
            user: sanitizeUser(user),
            tokens,
			msg,
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
	async logout(userId: number): Promise<void> {
		// notifier la websocket pour deconnecter les autres sessions si besoin
		// rien a faire pour l'instant car les tokens sont stateless
		// on pourrait implementer une blacklist des tokens si besoin
		// mais ca complexifie inutilement le systeme
		// donc on laisse comme ca pour l'instant

		// est il possible de decompter le nombre de sessions actives pour un utilisateur ?
		// et de notifier tout le monde uniquement quand la derniere session se deconnecte ?
		
		return;
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
                id: Number(id),
            },
        });
        if (!user?.id) {
            return null;
        }
        return user;
    }
}
