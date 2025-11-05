import { FriendError } from "../services/friendService";


export class FriendException extends Error {
    constructor(public code: FriendError, message?: string) {
        super(message ?? code);
        this.name = 'FriendException';
}
}