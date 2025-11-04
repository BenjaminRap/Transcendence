import { PrismaClient } from '@prisma/client';

import { AuthService } from '../services/authService.js';
import { UsersService } from '../services/usersService.js';
import { SuscriberService } from '../services/suscriberService.js';

import { AuthController } from '../controllers/authController.js';
import { UsersController } from '../controllers/usersController.js';
import { SuscriberController } from '../controllers/suscriberController.js';

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

        this.registerService('usersService', () => new UsersService(
            prisma
        ));

        this.registerService('suscriberService', () => new SuscriberService(
            prisma,
            this.getService('passwordHasher')
        ));

        // Controllers
        this.registerService('authController', () => new AuthController(
            this.getService('authService')
        ));

        this.registerService('usersController', () => new UsersController(
            this.getService('usersService')
        ));

        this.registerService('suscriberController', () => new SuscriberController(
            this.getService('suscriberService')
        ));

        // Middleware
        this.registerService('authMiddleware', () => new AuthMiddleware(
            this.getService('tokenManager')
        ));
    }
}

