export interface UpdateData
{
    username?:  string,
    avatar?:    string,
}


export interface UpdatePassword
{
    currentPassword:    string,
    newPassword:        string,
    confirmNewPassword: string
}

export interface DeleteAccount
{
    tokenKey:       string,
    confirmChoice:  boolean,
}

export interface SuscriberStats
{
    gamesPlayed: number,
    gamesWon:    number,
    winRate:     number,
}