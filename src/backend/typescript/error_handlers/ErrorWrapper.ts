import { AuthException, AuthError } from "./Auth.error";
import { FriendException, FriendError } from "./Friend.error";
import { FileException, FileError } from "./FileHandler.error";
import { UsersException, UsersError } from "./Users.error";
import { SuscriberException, SuscriberError } from "./Suscriber.error";
import { MatchException, MatchError } from "./Match.error";
import { TournamentException, TournamentError } from "./Tournament.error";


export class ErrorWrapper {
    static analyse(error: any): { code: number; message: string } {
        switch (error.constructor) {
            case AuthException:
                const authError = error as AuthException;
                if (authError.code === AuthError.INVALID_CREDENTIALS)
                    return { code: 401, message: authError?.message || authError.code };
                else if (authError.code === AuthError.USR_NOT_FOUND)
                    return { code: 404, message: authError?.message || authError.code };
                else if (authError.code === AuthError.USERNAME_TAKEN || authError.code === AuthError.EMAIL_TAKEN)
                    return { code: 409, message: authError?.message || authError.code };
                else
                    return { code: 401, message: authError?.message || authError.code };

            case FriendException:
                const friendError = error as FriendException;
                if (friendError.code === FriendError.USR_NOT_FOUND)
                    return { code: 404, message: friendError?.message || friendError.code };
                else if (friendError.code === FriendError.ACCEPTED || friendError.code === FriendError.PENDING)
                    return { code: 409, message: friendError?.message || friendError.code };
                else
                    return { code: 400, message: friendError?.message || friendError.code };

            case FileException:
                const fileError = error as FileException;
                if (fileError.code === FileError.NO_FILE)
                    return { code: 400, message: fileError?.message || fileError.code };
                else if (fileError.code === FileError.TOO_LARGE)
                    return { code: 413, message: fileError?.message || fileError.code };
                else if (fileError.code === FileError.BAD_FORMAT || fileError.code === FileError.INVALID_HEADER_TYPE)
                    return { code: 415, message: fileError?.message || fileError.code };
                else
                    return { code: 400, message: fileError?.message || fileError.code };

            case UsersException:
                const usersError = error as UsersException;
                if (usersError.code === UsersError.USER_NOT_FOUND)
                    return { code: 404, message: usersError?.message || usersError.code };
                else
                    return { code: 400, message: usersError?.message || usersError.code };

            case SuscriberException:
                const suscriberError = error as SuscriberException;
                if (suscriberError.code === SuscriberError.USER_NOT_FOUND)
                    return { code: 404, message: suscriberError?.message || suscriberError.code };
                else if (suscriberError.code === SuscriberError.INVALID_CREDENTIALS)
                    return { code: 401, message: suscriberError?.message || suscriberError.code };
                else if (suscriberError.code === SuscriberError.USRNAME_ALREADY_USED)
                    return { code: 409, message: suscriberError?.message || suscriberError.code };
                else
                    return { code: 400, message: suscriberError?.message || suscriberError.code };

            case MatchException:
                const matchError = error as MatchException;
                if (matchError.code === MatchError.USR_NOT_FOUND)
                    return { code: 404, message: matchError?.message || matchError.code };
                else
                    return { code: 400, message: matchError?.message || matchError.code };

            case TournamentException:
                const tournamentError = error as TournamentException;
                if (tournamentError.code === TournamentError.TOURNAMENT_NOT_FOUND || tournamentError.code === TournamentError.MATCH_NOT_FOUND || tournamentError.code === TournamentError.USER_NOT_FOUND)
                    return { code: 404, message: tournamentError?.message || tournamentError.code };
                else if (tournamentError.code === TournamentError.UNAUTHORIZED)
                    return { code: 401, message: tournamentError?.message || tournamentError.code };
                else if (tournamentError.code === TournamentError.TOURNAMENT_LIMIT_EXCEEDED)
                    return { code: 409, message: tournamentError?.message || tournamentError.code };
                else
                    return { code: 400, message: tournamentError?.message || tournamentError.code };
            default:
                return { code: 422, message: 'The data cannot be processed' };
        }
    }
}