import { SuscriberError } from "../services/suscriberService";

export class SuscriberException extends Error {
    constructor(public code: SuscriberError, message?: string) {
        super(message ?? code);
        this.name = 'SuscriberException';
    }
}
