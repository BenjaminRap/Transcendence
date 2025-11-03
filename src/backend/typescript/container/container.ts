import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/authService.js';
import { AuthController } from '../controllers/authController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';
import { PasswordHasher } from '../utils/passwordHasher.js';
import { TokenManager } from '../utils/tokenManager.js';

export class Container {
    private static instance: Container;
    private services: Map<string, any> = new Map();

    private constructor() {}

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    registerService<T>(key: string, factory: () => T): void {
        this.services.set(key, factory());
    }

    getService<T>(key: string): T {
        if (!this.services.has(key)) {
            throw new Error(`Service ${key} not found`);
        }
        return this.services.get(key);
    }

    // Méthode d'initialisation
    initialize(prisma: PrismaClient): void {
        // Utilitaires
        this.registerService('passwordHasher', () => new PasswordHasher());
        this.registerService('tokenManager', () => new TokenManager(
            process.env.JWT_ACCESS_SECRET!,
            process.env.JWT_REFRESH_SECRET!
        ));

        // Services
        this.registerService('authService', () => new AuthService(
            prisma,
            this.getService('passwordHasher'),
            this.getService('tokenManager')
        ));

        // Controllers
        this.registerService('authController', () => new AuthController(
            this.getService('authService')
        ));

        // Middleware
        this.registerService('authMiddleware', () => new AuthMiddleware(
            this.getService('tokenManager')
        ));
    }
}

