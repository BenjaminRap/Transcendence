export function sanitizeUser(user) {
    return {
        id: String(user.id),
        username: user.username,
        avatar: user.avatar
    };
}
