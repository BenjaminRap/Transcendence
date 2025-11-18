export interface UpdateData
{
    username?:  string,
    avatar?:    string,
}


export interface UpdatePassword
{
    tokenKey:           string,
    newPassword:        string,
    confirmNewPassword: string,
    confirmChoice:      boolean,
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