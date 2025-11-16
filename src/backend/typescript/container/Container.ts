import { PrismaClient } from '@prisma/client';

import { AuthService } from '../services/AuthService.js';
import { UsersService } from '../services/UsersService.js';
import { SuscriberService } from '../services/SuscriberService.js';
import { FriendService } from '../services/FriendService.js';
import { MatchService } from '../services/MatchService.js';

import { AuthController } from '../controllers/AuthController.js';
import { UsersController } from '../controllers/UsersController.js';
import { SuscriberController } from '../controllers/SuscriberController.js';
import { FriendController } from '../controllers/FriendController.js';
import { MatchController } from '../controllers/MatchController.js';

import { PasswordHasher } from '../utils/PasswordHasher.js';
import { TokenManager } from '../utils/TokenManager.js';

import { AuthMiddleware } from '../middleware/AuthMiddleware.js';

import { GameInterface } from '../interfaces/GameInterface.js';

export class Container {
    private constructor() {}
    private static instance: Container;

    private services: Map<string, any> = new Map();
    
    // ----------------------------------------------------------------------------- //
    static getInstance(prisma?: PrismaClient): Container {
        if (!Container.instance) {
            Container.instance = new Container();

            if (!prisma)
                throw Error("Init impossible: missed PrismaClient");

            Container.instance.initialize(prisma);
        }

        if (!Container.instance)
            throw Error('Container initialization has not started or has not completed.')

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

    // ==================================== PRIVATE ==================================== //

    // ----------------------------------------------------------------------------- //
    private initialize(prisma: PrismaClient): void {
        
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
        ));

        this.registerService('MatchService', () => new MatchService(
            prisma
        ));

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
        ));

        this.registerService('MatchController', () => new MatchController(
            this.getService('MatchService')
        ));

        // Middleware
        this.registerService('AuthMiddleware', () => new AuthMiddleware(
            this.getService('TokenManager')
        ));

        // Facade
        this.registerService('GameService', () => new GameInterface(
            this.getService('MatchController')
        ));
    }
}

