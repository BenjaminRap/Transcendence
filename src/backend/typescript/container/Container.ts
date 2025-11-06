import { PrismaClient } from '@prisma/client';

import { AuthService } from '../services/AuthService.js';
import { UsersService } from '../services/usersService.js';
import { SuscriberService } from '../services/SuscriberService.js';

import { AuthController } from '../controllers/AuthController.js';
import { UsersController } from '../controllers/UsersController.js';
import { SuscriberController } from '../controllers/suscriberController.js';

import { AuthMiddleware } from '../middleware/authMiddleware.js';
import { PasswordHasher } from '../utils/passwordHasher.js';
import { TokenManager } from '../utils/tokenManager.js';
import { FriendController } from '../controllers/FriendController.js';
import { FriendService } from '../services/FriendService.js';

export class Container {
    private constructor() {}
    private static instance: Container;

    private services: Map<string, any> = new Map();
    
    // ----------------------------------------------------------------------------- //
    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    // ----------------------------------------------------------------------------- //
    registerService<T>(key: string, factory: () => T): void {
        this.services.set(key, factory());
    }

    // ----------------------------------------------------------------------------- //
    getService<T>(key: string): T {
        if (!this.services.has(key)) {
            throw new Error(`Service ${key} not found`);
        }
        return this.services.get(key);
    }

    // ----------------------------------------------------------------------------- //
    initialize(prisma: PrismaClient): void {
        
        // Utils
        this.registerService('PasswordHasher', () => new PasswordHasher());
        
        this.registerService('TokenManager', () => new TokenManager(
            process.env.JWT_ACCESS_SECRET!,
            process.env.JWT_REFRESH_SECRET!
        ));

        // Services
        this.registerService('AuthService', () => new AuthService(
            prisma,
            this.getService('PasswordHasher'),
            this.getService('TokenManager')
        ));

        this.registerService('UsersService', () => new UsersService(
            prisma
        ));

        this.registerService('SuscriberService', () => new SuscriberService(
            prisma,
            this.getService('PasswordHasher')
        ));

        this.registerService('FriendService', () => new FriendService(
            prisma
        ))

        // Controllers
        this.registerService('AuthController', () => new AuthController(
            this.getService('AuthService')
        ));

        this.registerService('UsersController', () => new UsersController(
            this.getService('UsersService')
        ));

        this.registerService('SuscriberController', () => new SuscriberController(
            this.getService('SuscriberService')
        ));

        this.registerService('FriendController', () => new FriendController(
            this.getService('FriendService')
        ))

        // Middleware
        this.registerService('AuthMiddleware', () => new AuthMiddleware(
            this.getService('TokenManager')
        ));
    }
}

