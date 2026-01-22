
export interface TournamentParticipant {
    playerId:   number | undefined;
    guestName:  string;
    alias:      string;
}

export interface CreateTournament {
  title:        string; // titre ou nom du tournois
  creatorId:    number | undefined;
  guestName:    string;
  participants: TournamentParticipant[]
}
