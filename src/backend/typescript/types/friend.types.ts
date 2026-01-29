import type { FriendProfile } from "@shared/ZodMessageType";

export interface ListFormat
{
    status:     string,
    updatedAt:  string,
    user:       FriendProfile | null,
}
