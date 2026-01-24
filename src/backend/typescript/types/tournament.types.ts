
export interface TournamentParticipant {
    userId:     number | undefined;
    guestName:  string;
    alias:      string;
}

export interface CreateTournament {
  title:            string;
  creatorId:        number | undefined;
  creatorGuestName: string;
  participants:     TournamentParticipant[]
}

export interface Ranking {
	alias: string,
	rank: number
}
