import bcrypt from 'bcrypt';

export class PasswordHasher {
    constructor() {}

    private saltRounds: number = 12;

    // --------------------------------------------------------------------------------- //
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    // --------------------------------------------------------------------------------- //
    async verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
