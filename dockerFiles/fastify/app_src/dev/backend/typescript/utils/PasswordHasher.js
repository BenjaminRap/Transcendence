import bcrypt from 'bcrypt';
export class PasswordHasher {
    constructor() {
        this.saltRounds = 12;
    }
    // --------------------------------------------------------------------------------- //
    async hash(password) {
        return bcrypt.hash(password, this.saltRounds);
    }
    // --------------------------------------------------------------------------------- //
    async verify(password, hash) {
        return bcrypt.compare(password, hash);
    }
}
